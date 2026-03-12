import crypto from 'node:crypto';
import * as certisfy from '../public/javascripts/certisfy/certisfy.js';

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

//var claim = {"id":"516f9e3ab0d54177a341fc4334815f91","certisfy_object":true,"timestamp":1773005022686,"signerID":"b58536f1e5fd376decbfa75b6c0c817463759a56","signedString":"{\"maskedFields\":[{\"aeb593fad3c4997cf20ab68949801d7917b09595d30efd341b1e00800f6f244d\":\"0a6d9ecee04cac0fe41c81f7282dc8376881f3446561f536dfb6308c4e569218\"},{\"1ad21e831022f91a11c3a97b0270dfef16c3e8f42f54e375902ebff8369ab056\":\"71362bfb0cc1ef0975c37d207635974f67438b0959cec5f82ec55aaeaf8b3b08\"},{\"pki-valid-from-time\":\"03/08/2026 00:01\"},{\"pki-expiration-time\":\"03/08/2026 23:59\"},{\"2f31572c5a5796233bbafe1a3f9e076c25117b85eee886121924443a693e0ca1\":\"ddce0d999a046e9f9d8645a006cb7310c774d9d149efe817a635c5771e711331\"},{\"20dec3a96909bc1c83839173637a3e00554820f3b084ebd6b4bf62487196f568\":\"17650b41a9962cc15a39e4e03bd00b805120426509dcaf42b9f90459596d4bcb\"}]}timestamp=1773005022686","trustChain":{"certs":[{"validfrom_date":1771972856000,"status_message":null,"issuer_finger_print":"760c57f586e865b9672fd30f19e69e576397735e","finger_print":"b58536f1e5fd376decbfa75b6c0c817463759a56","authority_status_message":null,"authority_suspension_date":null,"revocation_date":null,"create_date":1771972859000,"expiration_date":2037994856000,"authority_status":null,"cert_text":"-----BEGIN CERTIFICATE-----\nMIIFkjCCBTmgAwIBAgIBATAKBggqhkjOPQQDAjAzMTEwLwYDVQQDDCg3NjBjNTdm\r\nNTg2ZTg2NWI5NjcyZmQzMGYxOWU2OWU1NzYzOTc3MzVlMB4XDTI2MDIyNDIyNDA1\r\nNloXDTM0MDczMTIxNDA1NlowEDEOMAwGA1UEAwwFSHVtYW4wWTATBgcqhkjOPQIB\r\nBggqhkjOPQMBBwNCAATUZUJPujhfBdgHDOdvUWrWZYU+/c5Os1EdPDwQMPIx+kvF\r\ncPCtvffzh3IVQhXN2iIwJ4OB+IKpOv2q6OuMpWD8o4IEXzCCBFswHQYDVR0OBBYE\r\nFJhiBtAPhLX/OoLENmsB0f06TVRVMIIEOAYDVR0RBIIELzCCBCuCggQneyJhZWI1\r\nOTNmYWQzYzQ5OTdjZjIwYWI2ODk0OTgwMWQ3OTE3YjA5NTk1ZDMwZWZkMzQxYjFl\r\nMDA4MDBmNmYyNDRkIjoiMGE2ZDllY2VlMDRjYWMwZmU0MWM4MWY3MjgyZGM4Mzc2\r\nODgxZjM0NDY1NjFmNTM2ZGZiNjMwOGM0ZTU2OTIxOCIsIjFhZDIxZTgzMTAyMmY5\r\nMWExMWMzYTk3YjAyNzBkZmVmMTZjM2U4ZjQyZjU0ZTM3NTkwMmViZmY4MzY5YWIw\r\nNTYiOiI3MTM2MmJmYjBjYzFlZjA5NzVjMzdkMjA3NjM1OTc0ZjY3NDM4YjA5NTlj\r\nZWM1ZjgyZWM1NWFhZWFmOGIzYjA4IiwiNzZjNGRkMmRjNmYyNmY0MjFhMjE1Y2Zj\r\nY2JlZTdhYTY0MmY0YTc5YWNlN2IyZThjYzZiMjE5YWVkYTJlZGEyNyI6ImNjYjEz\r\nY2NkYzM3ZTNlOGMxZmU4Mjg4NDE4MmNiZGM3NzA0ODNjZGRkYjdiY2Y5Yjc2ODJh\r\nMmMyYjYzYzk1NDkiLCIyZjMxNTcyYzVhNTc5NjIzM2JiYWZlMWEzZjllMDc2YzI1\r\nMTE3Yjg1ZWVlODg2MTIxOTI0NDQzYTY5M2UwY2ExIjoiZGRjZTBkOTk5YTA0NmU5\r\nZjlkODY0NWEwMDZjYjczMTBjNzc0ZDlkMTQ5ZWZlODE3YTYzNWM1NzcxZTcxMTMz\r\nMSIsInBraS1hc3ltLWVuY3J5cHRpb24ta2V5IjoiLS0tLS1CRUdJTiBQVUJMSUMg\r\nS0VZLS0tLS1cbk1JSUJJakFOQmdrcWhraUc5dzBCQVFFRkFBT0NBUThBTUlJQkNn\r\nS0NBUUVBaXUxTGZuMHU4N3JBZ3h6TWdzaVdcclxuOWxRZHRUWWtkYXR1eFZUTWtx\r\neWc2WTZxUmVWeUpyTlBZVmcxSkZDNXB6Y1I5d2c1QktCZmxBaytMY3VQUDVRSlxy\r\nXG5lQzkvL0JCWTluajVFWTBJa1hvQTh5eVZVR3J4V0dSTUlsamtwdlZqV1FWcy9Z\r\nWFJjS2RNaktFRjVWMjdBejAyXHJcbnlvVnRVdStrTEtYSHNoakI3bHN0SnNBZkM5\r\nWHc1QVlNZlJoVkNaNkZkWDdFQktOalhwTmpnYXJIcWxkeUVWOTJcclxuVlFDeFpj\r\nc1JEZHAvb1dtcjlwcmVBQ3NEeHR0bjZZd0xiZ25WNkNHOXl5b1N4WTQ4b3p1RUxx\r\nM0kvWlovb0czSFxyXG5qUk9NcU95ZisrZ2tSYnlaZlh5OVNidTllbk9SakpZbkI0\r\nS04xUXVHNjkrc2ZSOUtwejI5T2JWNCtUNHVibXBhXHJcbnB3SURBUUFCXG4tLS0t\r\nLUVORCBQVUJMSUMgS0VZLS0tLS1cbiIsInBraS1jZXJ0LXZlcnNpb24iOiIxLjUi\r\nfTAKBggqhkjOPQQDAgNHADBEAiBHFwYdG02WZq4ssj0jOwse8QByh0D/wQnBC1QU\r\n99121wIgF6QSj5NV51Y8RTZ2QL7/6ESDjrF/M2hNN5c/TEEsDLM=\n-----END CERTIFICATE-----\n","status":null},{"validfrom_date":1705340243000,"status_message":null,"issuer_finger_print":"594e1fe91a54c5f9adaa8956fa79360346c18766","finger_print":"760c57f586e865b9672fd30f19e69e576397735e","authority_status_message":null,"authority_suspension_date":null,"revocation_date":null,"create_date":1706059343000,"expiration_date":2020959443000,"authority_status":null,"cert_text":"-----BEGIN CERTIFICATE-----\nMIICXTCCAgOgAwIBAgIFAMD/3t8wCgYIKoZIzj0EAwIwMzExMC8GA1UEAwwoNTk0\nZTFmZTkxYTU0YzVmOWFkYWE4OTU2ZmE3OTM2MDM0NmMxODc2NjAeFw0yNDAxMTUx\nNzM3MjNaFw0zNDAxMTUxNzM3MjNaMBAxDjAMBgNVBAMMBUh1bWFuMFkwEwYHKoZI\nzj0CAQYIKoZIzj0DAQcDQgAEzS1n6wzip3+IaQzJjQUPxPbAaXr1gQGtwe1XWkAX\nzShbQjvhgiQK5Gv+wMplFUacmG6cigthE5/ZgN1fyUC4HqOCASUwggEhMAkGA1Ud\nEwQCMAAwZAYDVR0OBF0EWzBZMBMGByqGSM49AgEGCCqGSM49AwEHA0IABM0tZ+sM\n4qd/iGkMyY0FD8T2wGl69YEBrcHtV1pAF80oW0I74YIkCuRr/sDKZRVGnJhunIoL\nYROf2YDdX8lAuB4wIgYDVR0jBBswGaEUpBIwEDEOMAwGA1UEAwwFSHVtYW6CAQEw\ngYkGA1UdEQSBgTB/gn17InBraS10cnVzdC1hbmNob3ItcmV2aWV3ZXIiOiI1OTRl\nMWZlOTFhNTRjNWY5YWRhYTg5NTZmYTc5MzYwMzQ2YzE4NzY2IiwicGtpLW1heGlt\ndW0tZGVsZWdhdGVzIjoiMTAwIiwibGFib3ItY29kZSI6IjExLTEwMTEifTAKBggq\nhkjOPQQDAgNIADBFAiEAh5ocna0DtiTrgwWDedIGHjRFZF0i5Mb/mNSdf1+EgkQC\nIAUYj5zAlgwu8o0zPFGlH0vcapIpTGO78fyWShzLuw5f\n-----END CERTIFICATE-----\n","status":null},{"validfrom_date":1705323628000,"status_message":null,"issuer_finger_print":null,"finger_print":"594e1fe91a54c5f9adaa8956fa79360346c18766","authority_status_message":null,"authority_suspension_date":null,"revocation_date":null,"create_date":1706059211000,"expiration_date":2020942828000,"authority_status":null,"cert_text":"-----BEGIN CERTIFICATE-----\nMIIDZzCCAwygAwIBAgIBATAKBggqhkjOPQQDAjAVMRMwEQYDVQQDDApQcm9tZXRo\r\nZXVzMB4XDTI0MDExNTEzMDAyOFoXDTM0MDExNTEzMDAyOFowEDEOMAwGA1UEAwwF\r\nSHVtYW4wWTATBgcqhkjOPQIBBggqhkjOPQMBBwNCAARi6BmjmSfz5KlOI0KXxkKL\r\nl7iYT+WZySxC7ImZgvAgY4ofyLU+LFvjjYu6+SQRH/XphtqNzeP6YMBDNLOY6AzZ\r\no4ICUDCCAkwwHQYDVR0OBBYEFFB00DwJh9ngK9xLHSa4EvWw8yOwMIICKQYDVR0R\r\nBIICIDCCAhyCggIYeyJwa2ktYXN5bS1lbmNyeXB0aW9uLWtleSI6Ii0tLS0tQkVH\r\nSU4gUFVCTElDIEtFWS0tLS0tXG5NSUlCSWpBTkJna3Foa2lHOXcwQkFRRUZBQU9D\r\nQVE4QU1JSUJDZ0tDQVFFQTJ0TnpwczlVNVNqN3E1Sy9adWJKXHJcbkVoaDVrOG9Y\r\nNHc0Vnk2RVhHT1lvazZVSmU3YVJ5aTgwZnBiYTRJMUtmTWpKUW5PSjUzQ2pmZWdK\r\nVzVud2J0OUFcclxuVnY5N2lGa0xCZlVzOTF0eVJBeTFjRy90MWdZMDhOM05naUdH\r\nUXNTeEI1dDRTUXVGMHNPTFB3NHhVTWYzNktZNlxyXG5DejlBMlYyNjhuZE8rdFJi\r\nTDl5UXN2Uk13c3Brd2hpcDJOQjhyemZFYkJxNngvV05zeXM5NXA4aUo3VEJRNkh5\r\nXHJcbkhVTkJaWEJyRVJFRDc2ZmJ3V0R1UFRaZzRYY3RqMjV5T25KNEE0SGpjNFZY\r\nU1dFeFhZWk1aY21HVytzaW0yNzNcclxuMTFoZTlRNkMxckluNmdBU3B3ZnV0N2lr\r\nT2lER291VlR0Z0UwbnFtbnc0cTJ5SU52bDU3NHo4Qys4S0pvTlgzRFxyXG5zUUlE\r\nQVFBQlxuLS0tLS1FTkQgUFVCTElDIEtFWS0tLS0tXG4iLCJ1cmwiOiJodHRwczov\r\nL2NpcGhlcmVkdHJ1c3QuY29tIn0wCgYIKoZIzj0EAwIDSQAwRgIhAKcvou9BeWIm\r\nktwVPZsSS8NNhduA2RDuDNpKsJn4vW8ZAiEA/uVqXLYavURiOlvy8iUFqnI0chvG\r\ndJg96BTWTcaQy6A=\n-----END CERTIFICATE-----\n","status":null}],"isValid":true,"isTrustworthy":true,"signature":{"certisfy_object":true,"signedString":"b58536f1e5fd376decbfa75b6c0c817463759a56760c57f586e865b9672fd30f19e69e576397735e594e1fe91a54c5f9adaa8956fa79360346c18766truetruetimestamp=1773005023280","signerID":"594e1fe91a54c5f9adaa8956fa79360346c18766","signature":"mWFQc8BVO683C106MWMK6E9DN7gggjH6FpGQEQ8VllmZpgYZPamRaWYMBQRTsxtW0zhY5V6yZL5+NoBRJ74FMQ==","timestamp":1773005023280,"trustChain":{"certs":[{"validfrom_date":1705323628000,"status_message":null,"issuer_finger_print":null,"finger_print":"594e1fe91a54c5f9adaa8956fa79360346c18766","authority_status_message":null,"authority_suspension_date":null,"revocation_date":null,"create_date":1706059211000,"expiration_date":2020942828000,"authority_status":null,"cert_text":"-----BEGIN CERTIFICATE-----\nMIIDZzCCAwygAwIBAgIBATAKBggqhkjOPQQDAjAVMRMwEQYDVQQDDApQcm9tZXRo\r\nZXVzMB4XDTI0MDExNTEzMDAyOFoXDTM0MDExNTEzMDAyOFowEDEOMAwGA1UEAwwF\r\nSHVtYW4wWTATBgcqhkjOPQIBBggqhkjOPQMBBwNCAARi6BmjmSfz5KlOI0KXxkKL\r\nl7iYT+WZySxC7ImZgvAgY4ofyLU+LFvjjYu6+SQRH/XphtqNzeP6YMBDNLOY6AzZ\r\no4ICUDCCAkwwHQYDVR0OBBYEFFB00DwJh9ngK9xLHSa4EvWw8yOwMIICKQYDVR0R\r\nBIICIDCCAhyCggIYeyJwa2ktYXN5bS1lbmNyeXB0aW9uLWtleSI6Ii0tLS0tQkVH\r\nSU4gUFVCTElDIEtFWS0tLS0tXG5NSUlCSWpBTkJna3Foa2lHOXcwQkFRRUZBQU9D\r\nQVE4QU1JSUJDZ0tDQVFFQTJ0TnpwczlVNVNqN3E1Sy9adWJKXHJcbkVoaDVrOG9Y\r\nNHc0Vnk2RVhHT1lvazZVSmU3YVJ5aTgwZnBiYTRJMUtmTWpKUW5PSjUzQ2pmZWdK\r\nVzVud2J0OUFcclxuVnY5N2lGa0xCZlVzOTF0eVJBeTFjRy90MWdZMDhOM05naUdH\r\nUXNTeEI1dDRTUXVGMHNPTFB3NHhVTWYzNktZNlxyXG5DejlBMlYyNjhuZE8rdFJi\r\nTDl5UXN2Uk13c3Brd2hpcDJOQjhyemZFYkJxNngvV05zeXM5NXA4aUo3VEJRNkh5\r\nXHJcbkhVTkJaWEJyRVJFRDc2ZmJ3V0R1UFRaZzRYY3RqMjV5T25KNEE0SGpjNFZY\r\nU1dFeFhZWk1aY21HVytzaW0yNzNcclxuMTFoZTlRNkMxckluNmdBU3B3ZnV0N2lr\r\nT2lER291VlR0Z0UwbnFtbnc0cTJ5SU52bDU3NHo4Qys4S0pvTlgzRFxyXG5zUUlE\r\nQVFBQlxuLS0tLS1FTkQgUFVCTElDIEtFWS0tLS0tXG4iLCJ1cmwiOiJodHRwczov\r\nL2NpcGhlcmVkdHJ1c3QuY29tIn0wCgYIKoZIzj0EAwIDSQAwRgIhAKcvou9BeWIm\r\nktwVPZsSS8NNhduA2RDuDNpKsJn4vW8ZAiEA/uVqXLYavURiOlvy8iUFqnI0chvG\r\ndJg96BTWTcaQy6A=\n-----END CERTIFICATE-----\n","status":null}],"isValid":true,"isTrustworthy":true,"signature":{"certisfy_object":true,"signedString":"594e1fe91a54c5f9adaa8956fa79360346c18766truetruetimestamp=1773005023328","signerID":"594e1fe91a54c5f9adaa8956fa79360346c18766","signature":"NOkv+i5kmta9gjIsH7ehFE/+g68zdd6HmYb/xeKDlElq6ZGDtP+Xq3dZQN4S73p/FL1feI8Wn2oWqyxpxVZAQg==","timestamp":1773005023328,"debug_verified":true}},"debug_verified":true}},"signature":"j3yZSiNe8mrLQPNO0I1m/2nO8ZnoiEV0PPb74iyDLo/SiFxC1PLdW2/QsrW6ha9u4OmvUVB8RxUo+vSC1TxOAQ==","pki-identity":{"pki-sp-identifier":"2d711642b726b04401627ca9fbac32f5c8530fb1903cc4db02258717921a4881","pki-sp-id-anchor-token-persona":"public","pki-sp-id-anchor-token":"01b896df8cbaba1504850dfa90fbde39d69bc31149ab9354049944c2c442aa80","pki-owner-id-info-cloak":"1c0f9c62f04cddfb5722f0d142d4ddf0e150e5caa5d8fe16c7e49f149713319f,1773005024472","pki-id-anchor-element":"US_DLN","pki-cosignature":{"certisfy_object":true,"signedString":"publicUS_DLN01b896df8cbaba1504850dfa90fbde39d69bc31149ab9354049944c2c442aa802d711642b726b04401627ca9fbac32f5c8530fb1903cc4db02258717921a4881j3yZSiNe8mrLQPNO0I1m/2nO8ZnoiEV0PPb74iyDLo/SiFxC1PLdW2/QsrW6ha9u4OmvUVB8RxUo+vSC1TxOAQ==timestamp=1773005024480","signerID":"594e1fe91a54c5f9adaa8956fa79360346c18766","signature":"PXqPdZDZGd8Z/7DMkdE11vg7fZ3Hv6md5ooSAFP2UaWwaEZxate4l7rRUPFY09KG7ddKzi0Pl6hCqrhosSNpAA==","timestamp":1773005024480,"debug_verified":true}},"plainFields":[{"Name":"Edmond Kemokai"},{"Occupation":"Founder/CEO | Cipheredtrust,Certisfy"},{"pki-valid-from-time":"03/08/2026 00:01"},{"pki-expiration-time":"03/08/2026 23:59"},{"pki-id-link":"61e4b18ad908a88d6dac6268e863b9622066a5679c5fc3933a6966671e4ee810,1771972759886"},{"pki-hmac-keys":"[\"98f56fd823434fffae82689d32005588\",\"a60b9d0806d742338917e3c9340b49fc\",\"92a657ac43df4fdd8457b70a8b99edb7\",\"3b275cda4e7b4823b593dab6a5d9bbfa\",\"ca650912c7814faeab375998078aab67\",\"894370a4cceb4dba94d4fb80cf51dff5\"]"}],"hashedPlainFields":[{"dcd1d5223f73b3a965c07e3ff5dbee3eedcfedb806686a05b9b3868a2c3d6d50":"c679749fddb2e58787233dbacf53eb410face2444494fa1dd33bfa68fcdf1e1b"},{"3c769560ced7be187e26568c0cca17f2409ae0dbd0044ec3a124c88eecabe70e":"a25cb7cced413425c532717a9f9ee5bdbc8e3819ebdc9d6e007ea31737fd2715"},{"pki-valid-from-time":"03/08/2026 00:01"},{"pki-expiration-time":"03/08/2026 23:59"},{"986bdb945442cc7a34d8d939a0bc5112a07c2664bd0f5425958a2be17f9ed575":"355fc82f87f526cd94e454789734563fac2c291b5d8752803d95e45574e6252a"},{"pki-hmac-keys":"[\"98f56fd823434fffae82689d32005588\",\"a60b9d0806d742338917e3c9340b49fc\",\"92a657ac43df4fdd8457b70a8b99edb7\",\"3b275cda4e7b4823b593dab6a5d9bbfa\",\"ca650912c7814faeab375998078aab67\",\"894370a4cceb4dba94d4fb80cf51dff5\"]"}],"hmacedPlainFields":[{"aeb593fad3c4997cf20ab68949801d7917b09595d30efd341b1e00800f6f244d":"0a6d9ecee04cac0fe41c81f7282dc8376881f3446561f536dfb6308c4e569218"},{"1ad21e831022f91a11c3a97b0270dfef16c3e8f42f54e375902ebff8369ab056":"71362bfb0cc1ef0975c37d207635974f67438b0959cec5f82ec55aaeaf8b3b08"},{"pki-valid-from-time":"03/08/2026 00:01"},{"pki-expiration-time":"03/08/2026 23:59"},{"2f31572c5a5796233bbafe1a3f9e076c25117b85eee886121924443a693e0ca1":"ddce0d999a046e9f9d8645a006cb7310c774d9d149efe817a635c5771e711331"},{"20dec3a96909bc1c83839173637a3e00554820f3b084ebd6b4bf62487196f568":"17650b41a9962cc15a39e4e03bd00b805120426509dcaf42b9f90459596d4bcb"}],"debug_verified":false}

certisfy.SET_SDK_MODE(true); 
certisfy.loadTrustRoots();


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
      const verification = await certisfy.verifyClaim(claim, "ppbv.certisfy.com", claim.trustChain);
  
      //for ppbv we'll also allow demo trust anchor certificates
      if(!certisfy.isClaimTrustworthy(verification) && (!verification.certChainVerification || certisfy.buildErrorList(verification).length >1 || !verification.certChainVerification.chain.find(e=>e.finger_print == certisfy.demoTrustAnchorFingerprint)))
        	return {error:`Claim is not trustworthy.`,claim,verification};
  
      const verificationResult = certisfy.getVerificationResult(verification,["pki-action"]);
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

      let verificationResult = certisfy.getVerificationResult(verification,["pki-action"]);
      const action = verificationResult.unverifiedInformation.fields.find(f=>f.name == 'pki-action').value;
    
      if(action == "ppbv-create-agreement"){

           //validate all included party claims
           const parties = [{claim:claim,verification:verification,verificationResult:verificationResult}];
        
           const agreementType = verificationResult.unverifiedInformation.fields.find(f=>f.name == 'agreement-type')?verificationResult.unverifiedInformation.fields.find(f=>f.name == 'agreement-type').value:null;
        
           for(const field of verificationResult.unverifiedInformation.fields){
               let claimObject = certisfy.textToClaimObject(field.value)
               if(claimObject){
                 	if(parties.slice(1).find(p=>p.verificationResult.ownerIdentityInformation.id == verificationResult.ownerIdentityInformation.id))
                      	return res.status(200).json({error:`There cannot be party duplicates to an agreement.`,claim:claimObject});
                 
                    //extract claim plain field list that is attached top-most enclosing 'claim'
                    claimObject = await certisfy.extractAndAttachPlainFields(claimObject,claim.plainFields);
                 
                    verification = await validateClaim(claimObject,action,CLAIM_TTL);
                    if(verification.error)
                      return res.status(200).json(verification);
                 
                    const partyVerificationResult = certisfy.getVerificationResult(verification)
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
              let expiryField = certisfy.getVerifiedCertificateField("pki-expiration-time",party.verification.fieldVerification.fields,true);
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
