let axios = require('axios')
let a = require("node_characterai")
let b = new a()
async function oy() {
    await b.authenticateWithToken(
        '4e453d46658c913e7d4fb1c2a4c21e8685af1e8b'
    );

     
    let response = await b.getRecentConversations()
    // const chat = await b.createOrContinueChat(characterId);
    // const response = await chat.sendAndAwaitResponse('Hello Chise!', true)

    return response
}
oy().then(console.log())
// let token =  'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6IkVqYmxXUlVCWERJX0dDOTJCa2N1YyJ9.eyJpc3MiOiJodHRwczovL2NoYXJhY3Rlci1haS51cy5hdXRoMC5jb20vIiwic3ViIjoiZ29vZ2xlLW9hdXRoMnwxMDQ0ODc0NDI3NDM0NjQwMzM0ODUiLCJhdWQiOlsiaHR0cHM6Ly9hdXRoMC5jaGFyYWN0ZXIuYWkvIiwiaHR0cHM6Ly9jaGFyYWN0ZXItYWkudXMuYXV0aDAuY29tL3VzZXJpbmZvIl0sImlhdCI6MTY4MDQxMzY3NSwiZXhwIjoxNjgzMDA1Njc1LCJhenAiOiJkeUQzZ0UyODFNcWdJU0c3RnVJWFloTDJXRWtucVp6diIsInNjb3BlIjoib3BlbmlkIHByb2ZpbGUgZW1haWwifQ.BLQGre8A0cW21zJ7rErZl8-vlHhtC2roj-Rk6G9UeHMqUX_COtKYVDx3RL6oRUPcwWbSAU8jPxTl7w-B5_YYWhN-lEcIwyYQYZmBlt3F0HGVS0iD-Agy9m-Z2NbTcURmx7Zvosk2BKc-vvzWQjm-7xy6c4IxpKPAawu53hqHidlN-6T7a9sfFX_zZT6CgwcfcsUsKznD6I2lotxqLbKsmfhUbe07piSE34GXjZ-XvfaZymG0BuNIQbjlZQGI3QnD4gQmpnraELgHcW3UHvyv2BxqC2Ht7Wb3f0W6WdynWLFHV9BscgON67YvOSYgD7W-7SPWgSEu5GgCFAB2OVlvcw'
// const characterId = "NnvRI8gbcIab0UPg3JgHWBOA9c3PDol1rY1_OV4eCO8"
// axios('https://beta.character.ai/chat/history/create/', {
//                     body:JSON.stringify({
//                         character_external_id: characterId,
//                         history_external_id: '4e453d46658c913e7d4fb1c2a4c21e8685af1e8b',
//                     }),
//                     method:'post',
//                     headers: {
//                         authorization: `Token ${token}`,
//                         'Content-Type': 'application/json',
//                     }
//                 }).then(console.log)