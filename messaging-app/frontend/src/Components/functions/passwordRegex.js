
export function regexCheck(password){
        const regex = /^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*\W)(?!.* ).{8,24}$/;
        const result = regex.test(password)
        return result
    }