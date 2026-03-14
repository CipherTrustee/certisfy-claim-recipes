### Cryptographic Implementation Of Exclusivity Agreements

This [Certisfy claims recipe](https://github.com/CipherTrustee/certisfy-claim-recipes) (call it Pinky-Promise-But-Verify (ppbv)) allows multi-party exclusivity agreements,
where one party can acquire approval from another party to lookup the other party in order to acertain that
they are not already comitted to a similar agreement or that they are in fact party to a certain type of
agreement.

The key value proposition with this recipe is that parties can decide to get into an agreement and
have a lightweight accountability or proof mechanism, all implemented in a private manner. 
In other words there are obviously other ways to implement such agreements, this approach has the aforementioned advantages.

This recipe is a simple demonstration, other implementations can be a lot more elaborate.

The implementation of this recipe can be accessed [here](https://certisfy.com/certisfy-claim-recipes/ppbv/).

You can use the demo certificates that come loaded with the Certisfy app to try it out yourself. You must first
create new identity anchor certificates for each party so they have unique cryptographic identities for joining
agreements. Use the demo trust anchor certificate for issuing trustworthy demo certificates.

For the demo identity anchor certificates, you can use random UUID for your identity anchor element value.

All claims for ppbv must be for private use.
The receiver id for all claims must be `ppbv.certisfy.com`
You must attach trust chain to all claims.

## Part I: Create And Submit Agreements

  1. Create a claim for agreement
      - optionally add field `statement`...I am getting into a relationship with Bob. 
      	You can use Certisfy nerd tools to encrypt this statement if it needs to be private.  
      - optionally add field `agreement-type` (for instance romantic...oh my.)
      - claims cannot be deleted once sumitted so use validity period judiciously to control life time.

  2. One member of the agreement must collect all other claims and include them as additional fields in their own agreement claim.
      - It doesn't matter what the field names are for included claims.  
      - add field `pki-action` with value `ppbv-create-agreement`  
      - *Note*: It is possible for the person collecting your claim to give it to someone else to sign you up for an
        agreement that you did not intend to be party to, fun things to consider :) 
        
        There are alternate implementation approaches that can address such issues. 
        The use of agreement type also offers some mitigation against this.

  3. Submit the claim to ppbv
      - no agreement claim can be older than 60 minutes.
      - ppbv will extract crypto id for each claim and add it to db table
      - create a uuid for agreement id and add it to db table

## Part II: Lookup Agreements

Agreements can only be looked up via approval claims, ie someone has to allow you to look them up.

There are two reasons you may want to lookup an agreement, first to determine if someone is already
party to a certain type of agreement; second, to prove to others that you are in an agreement with other
parties.

  1. Create a lookup approval claim
      - add field `pki-action`, set the value to `ppbv-lookup-agreement`.
      - optionally add field `agreement-type`, this will restrict lookup to a particular agreement type.
      - optionally add field `agreement-id`, this will restrict lookup to a particular agreement id.
      - if a lookup claim does not apply either an `agreement-id` or `agreement-type` filter, 
        it is assumed to be a lookup by the owner of the claim and will just list all 
        agreements they are party to.
      - lookup approval claim must be short-lived so it isn't abused.
        ppbv will only accept lookup approval claims that are no older than 60 minutes.

  2. Give lookup approval claims to others to look up agreements  
      - lookup can be restricted to an `agreement-id` or `agreement-type`.
        in the case that a lookup is restricted to a particular id, 
        the person doing lookup should be alerted to the fact that the approver 
        may be hiding other relevant agreements.
      - lookup result will include agreement id and any associated statements.
      - *No one will ever cheat on you again!* ...maybe?
      
## Part III: Terminating Agreements
Parties can mutually agree to terminate an agreement.

  1. Create a termination request claim
      - add field `pki-action`, set the value to `ppbv-terminate-agreement`.
      - field `agreement-id` is the id of the agreement to terminate.
      - termination request claim must be short-lived so it isn't abused.
        ppbv will only execute termination request claims if all parties to an 
        agreement submit a request within a 60-minute time window.
      - *Break up confirmed!*
      
