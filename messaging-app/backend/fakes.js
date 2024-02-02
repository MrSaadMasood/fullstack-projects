const { faker } = require("@faker-js/faker")


for(let i = 0; i < 5; i++){
    const username = faker.internet.userName()
    const email = faker.internet.email()
    const password = faker.internet.password({ length: 12 , memorable : true })
    console.log("the username is", username)
    console.log("the email is", email)
    console.log("the password is", password)
    console.log("---------------------------------")
}