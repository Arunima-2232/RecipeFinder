import React,{useState} from 'react'
import { BASE_URL } from '../config/api'
import { useNavigate } from 'react-router-dom';
import '../style/LoginStyle.css'

export default function Login()
{
    const [userDetails,setUserDetails]=useState(
        {
            email:"",
            password:""
        }
    )
    const [popupMessage,setPopupMessage]=useState("")

    const navigate = useNavigate();
    const popupStyle={
        display: popupMessage? 'block':'none'
    }

    function toRecipeFinder(){
        navigate("/recipeFinder");
    }

    function checkValidity(event)
    {
        if(Object.values(userDetails).some(val=>!val))
            setPopupMessage("Please fill all details.")
        else if(userDetails.password.toString().length<5||userDetails.password.toString().length>50)
            setPopupMessage("Password should be in range 5 to 50 characters.")
        else
            userLogin(event)

    }

    async function userLogin(event)
    {
        try{
            event.preventDefault();
            const response=await BASE_URL.post("/login",userDetails);
            if(response.data.status!==200)
                setPopupMessage(response.data.data)
            else
            {
                // sessionStorage.setItem("Id",userDetails.emailId)
                // sessionStorage.setItem("token",response.data.token)
                setPopupMessage("Successful Login! Please wait a moment.")
                console.log("Successful Login! Please wait a moment.")
                toRecipeFinder();
            }
        }
        catch(error)
        {
            setPopupMessage("Please try again later.")
        }
    }

    function handleChange(e)
    {
        const {name,value}=e.target;
        setUserDetails(prev => ({
        ...prev,
        [name]: value
        }));
    }

    return(
        <>
        <div id="popup" style={popupStyle}>
            {popupMessage}
            <br/>
            <button 
            onClick={()=>{setPopupMessage("")}}
            >OK</button>
        </div>
        <div className="container">
            <p className="title">LeftoverRoulette - Recipe Finder</p>
            <p className="subtitle">Login</p>
            <form className="form">
                <fieldset>

                <label htmlFor="userID">Enter Email ID</label>
                <input type="email" name="email" id="userID" onChange={handleChange} required/>

                <label htmlFor="userPassword">Enter Password</label>
                <input type="password" name="password" id="userPassword" onChange={handleChange} required/>

                <div className="button-group">
                    {/* <button
                    type="submit"
                    className="main-btn"
                    onClick={toSignup}
                    >
                    Signup
                    </button> */}

                    <button
                    type="button"
                    className="enabledBtn"
                    onClick={checkValidity}
                    >
                    Login
                    </button>
                </div>

                </fieldset>
            </form>
            </div>
        </>
    )
}