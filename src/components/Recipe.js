import React, { useEffect, useState } from 'react'
import { BASE_URL } from '../config/api'
import '../style/MainStyle.css'
function Recipe() {

  const [recipes,setRecipes]=useState([])
  const [view,setView]=useState(false)
  const [message,setMessages]=useState([])
  const [userInput,setUserInput]=useState("")
  const [popupMessage,setPopupMessage]=useState("")
  const [dish, setDish]=useState(
    {
      "title":"",
      "ingredients":"",
      "instructions":""
    }
  )

  const popupStyle={
        display: popupMessage? 'block':'none'
    }

    async function loadRecipes()
    {
      try{
        const response = await BASE_URL.get("/recipe",{
          params: {
            email: "abcd@gmail.com"
          }
        })
        setRecipes(response.data.data)
      }
      catch(error)
      {
        console.log(error.response.data);
      }
    }

  useEffect(()=>{
    loadRecipes();
  },[])

  function handleUserInput(event)
  {
    setUserInput(event.target.value)
  }

  function viewDish(e)
  {
    setView(true)
    setDish(
      {
        "title":e.title,
        "ingredients":e.ingredients,
        "instructions":e.instructions
      }
    )
  }

  async function handleUserPrompt(event)
  {
    if(event.key==='Enter')
      {
        try
        {
          const response=(await BASE_URL.get("/query",{
            params: {
              userPrompt: userInput
            },
            withCredentials: true
          }))
          if(response.data.name=="error")
            {
              setPopupMessage(response.data.data)
            }
          else
          {
            let botAnswer 
              botAnswer=response.data.data
            setMessages(prev=>[...prev,{
                "role":"user",
                "content":userInput
              },
              {
                "role":"assistant",
                "content":botAnswer
              }
              ])
            }
            setUserInput("")
            loadRecipes()
        }
        catch(error)
        {
          console.log(error.response.data)
        }
      }
  }

  return (
    <>
    <div id="popup" style={popupStyle}>
            {popupMessage}
            <br/>
            <button 
            onClick={()=>{setPopupMessage("")}}
            >OK</button>
        </div>
    <div id="header">
      <h2>
        What's In My Kitchen?
      </h2>
      <p>
        Discover Recipes Beyond Your Cookbook.
      </p>
      <div id="userDetails">
        <p>Total number of recipes: {recipes.length}</p>
      </div>
    </div>

      <div id="page">
        <div id="recipes">
          <div id="dish">
            {
              recipes?.map(dish => (
                <div key={dish.id} onClick={()=>viewDish(dish)}>
                  <p>{dish.title}</p>
                  <p>{dish.ingredients}</p>
                </div>
              ))
            }
            </div>
        </div>
        
        {!view&&(
          <div id="chatbotANDdisplay">
          <div id="chatANDdish">
            {
              message?.map((msg,index)=>(
                <div key={index} className={
                  msg.role==='user'?'userMsg':'assistantMsg'
                }>
                  <p style={{ whiteSpace: 'pre-line' }}>{msg.role}:<br/>
                    {msg.content}</p>
                  </div>
              ))
            }
          </div>
          <textarea onChange={handleUserInput} onKeyDown={handleUserPrompt}  value={userInput} placeholder='Hello! How can i help you?'></textarea>
        </div>
      )}
      {view&&(
        <div id="chatbotANDdisplay">
          <div id="chatANDdish" style={{whiteSpace:'pre-line', margin:'auto'}}>
            <p style={{fontSize:'25px',textAlign:'center', fontWeight:'700'}}>{dish.title}</p><br/>
            <p style={{fontSize:'18px'}}><u>Ingredients:</u><br/>{dish.ingredients}</p><br/>
            How to make:<br/><br/>{dish.instructions}
          </div>
          <button id="backToChatbot" onClick={()=>{setView(false)}}>Go back to chatbot</button>
        </div>
      )}
      </div>
    </>
  )
}

export default Recipe
