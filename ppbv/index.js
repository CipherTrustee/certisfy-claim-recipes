import crypto from 'node:crypto';
import {createSDK} from '../public/javascripts/certisfy/src/loader.js';

// express = require('express');
import express from 'express'; 
import path from 'path';
import pg from 'pg';

const { Pool } = pg;
const pool = new Pool({
  user: 'certisfy',        // Your default Postgres username
  host: 'localhost',
  database: 'certisfy',    // Your database name
  password: 'certisfy', 
  port: 5432,              // Default Postgres port
});
var router = express.Router();

const certisfySDK = await createSDK();

/* GET home page. */
router.get('/', async function(req, res, next) {  
  // Use path.join to create an absolute path to your file
  //res.sendFile(path.join(__dirname, 'index.html')); 
  res.sendFile(path.join(import.meta.dirname, 'index.html'));

  //res.send('Certisfy PPBV')
});

// 2. Serve PPBVApp-module.js when it's requested at "/PPBVApp-module.js"
router.get('/PPBVApp-module.js', (req, res) => {
  //res.sendFile(path.join(__dirname, 'PPBVApp-module.js'));
   res.sendFile(path.join(import.meta.dirname, 'PPBVApp-module.js')); 
});

async function validateClaim(claim,action,ttl){
      const verification = await certisfySDK.verifier.verifyClaim(claim, "ppbv.certisfy.com", claim.trustChain);
  
      //for ppbv we'll also allow demo trust anchor certificates
      if(!certisfySDK.verifier.isClaimTrustworthy(verification) && (!verification.certChainVerification || certisfySDK​.verifier.buildErrorList(verification).length >1 || !verification.certChainVerification.chain.find(e=>e.finger_print == certisfySDK.getConfig().demoTrustAnchorFingerprint)))
        	return {error:`Claim is not trustworthy.`,claim,verification};
  
      const verificationResult = certisfySDK.verifier.getVerificationResult(verification,["pki-action"]);
  	  if(verificationResult.ownerIdentityInformation.personaType != "private")  
  			return {error:`Claim must be created for private use.`,claim,verification,verificationResult};
  
      const actionReq = verificationResult.unverifiedInformation && verificationResult.unverifiedInformation.fields.find(f=>f.name == 'pki-action')?verificationResult.unverifiedInformation.fields.find(f=>f.name == 'pki-action').value:null;
	  if(action && (!actionReq || !action.includes(actionReq)))
        	return {error:`Invalid claim action (${actionReq}).`,claim,verification,verificationResult};
  
  	  if(ttl){
          let signedTS = parseInt(claim.signedString.substring(claim.signedString.lastIndexOf("=")+1));
          if((new Date().getTime() - signedTS)> (ttl*60*1000))
              return {error:`Invalid claim age.`,claim,verification,verificationResult};      
      }

      return verification;
}

/*
 * Author: chatgpt.
 * Prompt: if i have a list of objects with a date field called termination_req_date and 
 * I want to know if all their dates fall within a 1 hour time window, in javascript write a 
 * function. if any of the termination_req_date is set to null then it should return false.
 */
function allWithinOneHour(items) {
  if (!items || items.length === 0) return false;

  const times = items.map(i => {
    if (i.termination_req_date == null) return null;
    const t = new Date(i.termination_req_date).getTime();
    return Number.isNaN(t) ? null : t;
  });

  if (times.includes(null)) return false;

  const min = Math.min(...times);
  const max = Math.max(...times);

  return (max - min) <= 60 * 60 * 1000;
}

router.post('/controller', async function(req, res, next) {
  try 
  {
      const CLAIM_TTL = 60;//minutes
      // Because it's in the body as x-www-form-urlencoded
      const claim = req.body.claim?JSON.parse(req.body.claim):null; 

      if (!claim) {
        return res.status(200).json({ error: `No claim found in body` });
      }
    
      let verification = await validateClaim(claim,["ppbv-create-agreement","ppbv-lookup-agreement","ppbv-terminate-agreement"],CLAIM_TTL);
      if(verification.error)
          return res.status(200).json(verification);

      let verificationResult = certisfySDK.verifier.getVerificationResult(verification,["pki-action"]);
      const action = verificationResult.unverifiedInformation.fields.find(f=>f.name == 'pki-action').value;
    
      if(action == "ppbv-create-agreement"){

           //validate all included party claims
           const parties = [{claim:claim,verification:verification,verificationResult:verificationResult}];
        
           const agreementType = verificationResult.unverifiedInformation.fields.find(f=>f.name == 'agreement-type')?verificationResult.unverifiedInformation.fields.find(f=>f.name == 'agreement-type').value:null;
        
           for(const field of verificationResult.unverifiedInformation.fields){
               let claimObject = certisfySDK.helperUtil.textToClaimObject(field.value)
               if(claimObject){
                 	if(parties.slice(1).find(p=>p.verificationResult.ownerIdentityInformation.id == verificationResult.ownerIdentityInformation.id))
                      	return res.status(200).json({error:`There cannot be party duplicates to an agreement.`,claim:claimObject});
                 
                    //extract claim plain field list that is attached top-most enclosing 'claim'
                    claimObject = await certisfySDK.claimData.extractAndAttachPlainFields(claimObject,claim.plainFields);
                 
                    verification = await validateClaim(claimObject,action,CLAIM_TTL);
                    if(verification.error)
                      return res.status(200).json(verification);
                 
                    const partyVerificationResult = certisfySDK.verifier.getVerificationResult(verification)
                    const partyAgreementType = partyVerificationResult.unverifiedInformation.fields.find(f=>f.name == 'agreement-type')?partyVerificationResult.unverifiedInformation.fields.find(f=>f.name == 'agreement-type').value:null;

                 	if(agreementType != partyAgreementType)
                      	return res.status(200).json({error:`All parties must agree to the same type of agreement.`,claim:claimObject});
                 
                    parties.push({claim:claimObject,verification:verification,verificationResult:partyVerificationResult});
               }
          }
        
           if(parties.length <2)
             return res.status(200).json({ error: `Agreements must include at least two parties.` });
        
          const agreementId = crypto.randomUUID();
        
          //determine expiration date of agreement, it will be first expired claim
          let agreementExpiration;
          for(const party of parties){
              let expiryField = certisfySDK.claimData.getVerifiedCertificateField("pki-expiration-time",party.verification.fieldVerification.fields,true);
              let expireDateText = expiryField["pki-expiration-time"].substring(0,expiryField["pki-expiration-time"].indexOf(" ")).trim();
              let expireTimeText = expiryField["pki-expiration-time"].substring(expiryField["pki-expiration-time"].indexOf(" ")).trim();
              let expireDateTime = new Date();
              expireDateTime.setUTCFullYear(parseInt(expireDateText.split("/")[2]),parseInt(expireDateText.split("/")[0])-1,parseInt(expireDateText.split("/")[1]));
              expireDateTime.setUTCHours(parseInt(expireTimeText.split(":")[0].trim()));
              expireDateTime.setUTCMinutes(parseInt(expireTimeText.split(":")[1].trim()));

          	  if(!agreementExpiration || expireDateTime.getTime()<agreementExpiration.getTime())
                	agreementExpiration = expireDateTime;
          }
        
          //commit the agreement          
          for(const party of parties){
              const statement = party.verificationResult.unverifiedInformation.fields.find(f=>f.name == 'statement')?party.verificationResult.unverifiedInformation.fields.find(f=>f.name == 'statement').value:null;

              const agreement = {
                crypto_id:party.verificationResult.ownerIdentityInformation.id, 
                agreement_id:agreementId, 
                agreement_type:agreementType, 
                claim:JSON.stringify(party.claim), 
                statement,
                expiration_date:agreementExpiration
              };

              const values = [
                agreement.crypto_id, 
                agreement.agreement_id, 
                agreement.agreement_type, 
                agreement.claim, 
                agreement.statement,
                agreement.expiration_date
              ];

              const insertStmtText = `
                INSERT INTO ppbv_claims (
                  crypto_id, agreement_id, agreement_type, 
                  claim, statement, expiration_date
                ) VALUES ($1, $2, $3, $4, $5,$6)
                RETURNING *;
              `;

              try 
              {
                  const result = await pool.query(insertStmtText, values);                               
              } 
              catch (err) {
                  console.error(err.stack);
                  return res.status(200).json({ error: `Database insertion failed`,exception:err });
              }
          }
        
          return res.status(200).json({status:"success",agreement_id:agreementId,action});     
      }
      else
      if(action == "ppbv-lookup-agreement"){
        
           const agreementId = verificationResult.unverifiedInformation.fields.find(f=>f.name == 'agreement-id')?verificationResult.unverifiedInformation.fields.find(f=>f.name == 'agreement-id').value:null;
           const agreementType = verificationResult.unverifiedInformation.fields.find(f=>f.name == 'agreement-type')?verificationResult.unverifiedInformation.fields.find(f=>f.name == 'agreement-type').value:null;

           const selectStmtText = `
              SELECT * FROM ppbv_claims 
              WHERE crypto_id = $1 
                AND (
                  ($2::varchar IS NULL AND $3::varchar IS NULL)
                  OR ($2::varchar IS NOT NULL AND $3::varchar IS NULL AND agreement_id = $2)
                  OR ($3::varchar IS NOT NULL AND $2::varchar IS NULL AND agreement_type = $3)
                )
           `;
        
           const selectPartyCountStmtText = `
              SELECT count(*) FROM ppbv_claims WHERE agreement_id = $1
           `;

           try 
           {
              const result = await pool.query(selectStmtText, [verificationResult.ownerIdentityInformation.id,agreementId,agreementType]);
             
              //retrive counter-party information,just number of other counter parties.
              let partyCount;
              if(result.rows.length>0){
                   const countResp = await pool.query(selectPartyCountStmtText, [result.rows[0].agreement_id]);
				   partyCount = parseInt(countResp.rows[0].count)
              } 
             
              return res.status(200).json({status:"success",rows:result.rows,partyCount,verificationResult,agreementId,agreementType,action});
           } 
           catch (err) {
              return res.status(200).json({ error: err.message });
           }
      }
      else
      if(action == "ppbv-terminate-agreement"){
           const agreementId = verificationResult.unverifiedInformation.fields.find(f=>f.name == 'agreement-id')?verificationResult.unverifiedInformation.fields.find(f=>f.name == 'agreement-id').value:null;

           const updateStmText = `
              UPDATE ppbv_claims 
			  SET termination_req_date = now()
              WHERE 
			  crypto_id = $1 AND agreement_id = $2;
           `;
        
           const selectStmtText = `
              SELECT * FROM ppbv_claims 
              WHERE 
			  agreement_id = $1;
           `;
        
           const deleteStmText = `
              DELETE FROM ppbv_claims WHERE agreement_id = $1;
           `;

           try 
           {
              //apply request
              await pool.query(updateStmText, [verificationResult.ownerIdentityInformation.id,agreementId]);             

              //get all parties
              const result = await pool.query(selectStmtText, [agreementId]);

              //ensure they are in fact party to the agreement with given id
              if(!result.rows.find(m=>m.crypto_id == verificationResult.ownerIdentityInformation.id))
                	return res.status(200).json({error:`Claim identity is not a party to the requested agreement id.`});

              //confirm they're all in agreement to terminate
              if(!allWithinOneHour(result.rows))
                	return res.status(200).json({status:"pending",message:`Request noted, it will be executed once all parties request termination within a 1 hour period.`,action,agreement_id:agreementId});

              //terminate
              await pool.query(deleteStmText, [agreementId]);  
             
              return res.status(200).json({status:"success",action});
           } 
           catch (err) {
              return res.status(200).json({ error: err.message });
           }
      }    
      else
      return res.status(200).json({ error: "Invalid action"});    
  } 
  catch (err) {
    next(err);
  }
});


//module.exports = router;

export default router;
