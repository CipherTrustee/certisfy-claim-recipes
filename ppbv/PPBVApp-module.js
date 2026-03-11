let appModule = {

  /*
   executes a claim request and handles the response views.
  */
  executeClaimRequest: async function (claimData) {
      try 
      {
        // Simulate an API call or processing of claimData
        const response = await this.processClaimData(claimData);
        return response;	
      } 
      catch (error) {
        alert(error);
        console.error("Error processing claim:", error);
      }    
  },

  // Stub for processing claim data
  processClaimData: async function(claimData) {
    //@prompt a post via fetch using claimdData as parameter called claim.
    //the post is url form encoded and not json and the endpoint is /ppbv

     // URL-encoded form data
      const formData = new URLSearchParams();
      formData.append('claim', claimData);

      // Perform the fetch request
      return new Promise((resolve,reject)=>{
          fetch('controller', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: formData
          })
          .then(response => {
            if (!response.ok) {
              throw new Error('Network response was not ok');
            }
            return response.json();
          })
          .then(data => {
            resolve(data);
          })
          .catch(error => {
            console.error('Error:', error);
            resolve({error:error})
          });      
      });
  }
};

export default appModule;