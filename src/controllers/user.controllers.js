import { promisehandler } from "../utils/promiseHandler.js";

const registerUser = promisehandler( async(req, res) => {
    res.status(200).json({
        message: 'ok'
    })
})

export default registerUser
