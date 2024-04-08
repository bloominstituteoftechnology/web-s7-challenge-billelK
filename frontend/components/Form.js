import React, { useEffect, useState } from 'react'
import * as yup from "yup"
import axios  from 'axios'

// 👇 Here are the validation errors you will use with Yup.
const validationErrors = {
  fullNameTooShort: 'full name must be at least 3 characters',
  fullNameTooLong: 'full name must be at most 20 characters',
  sizeIncorrect: 'size must be S or M or L'
}

// 👇 Here you will create your schema.
const formSchema = yup.object().shape({
  fullName: yup.string().required("Full Name is Required").min(3, validationErrors.fullNameTooShort).max(20, validationErrors.fullNameTooLong),
  size: yup.string().required("size is required").oneOf(["S","M","L"], validationErrors.sizeIncorrect)
})
// 👇 This array could help you construct your checkboxes using .map in the JSX.
const toppings = [
  { topping_id: '1', text: 'Pepperoni' },
  { topping_id: '2', text: 'Green Peppers' },
  { topping_id: '3', text: 'Pineapple' },
  { topping_id: '4', text: 'Mushrooms' },
  { topping_id: '5', text: 'Ham' },
]

export default function Form() {
  const [formVals,setFormVals] = useState({fullName: "", size:"", toppings: []})
  const [errors, setErrors] = useState({fullName: "", size: ""})
  const [success, setSuccess] = useState("")
  const [failure, setFailure] = useState("")
  const [submit, setSubmit] = useState(false)

  useEffect(() => {
    formSchema.isValid(formVals).then(valid => setSubmit(valid))
  }, [formVals])

  const onSubmit = (e) => {
    e.preventDefault()
    axios.post("http://localhost:9009/api/order", formVals)
      .then(res => {
        setSuccess(res.data.message)
        setFailure("")
        setFormVals({fullName: "", size: "", toppings: []})
      })
      .catch(error => {
        setSuccess("")
        setFailure(error.response.data.message)
      })
  }

  const onChange = (e) => {
    let {name, type, checked, value, id} = e.target
    if (type === "checkbox"){
      if (checked) {
        formVals.toppings.includes(id) ? value = [...formVals.toppings] : value = [...formVals.toppings, id]
        setFormVals({...formVals, toppings: value})
      } else {
        let index = formVals.toppings.indexOf(name)
        formVals.toppings.splice(index,1)
        value = [...formVals.toppings]
        setFormVals({...formVals, toppings: value})
      }  
    } else {
      setFormVals({...formVals, [name]: value})
      yup.reach(formSchema, name)
        .validate(value)
        .then(() => setErrors({...errors, [name]: ""}))
        .catch(error => setErrors({...errors, [name]: error.errors[0]}))
    }
  }

  return (
    <form onSubmit={onSubmit}>
      <h2>Order Your Pizza</h2>
      {success && <div className='success'>{success}</div>}
      {failure && <div className='failure'>{failure}</div>}

      <div className="input-group">
        <div>
          <label htmlFor="fullName">Full Name</label><br />
          <input onChange={onChange} placeholder="Type full name" id="fullName" name='fullName' value={formVals.fullName} type="text" />
        </div>
        {errors.fullName && <div className='error'>{errors.fullName}</div>}
      </div>

      <div className="input-group">
        <div>
          <label htmlFor="size">Size</label><br />
          <select onChange={onChange} name='size' value={formVals.size} id="size">
            <option value="">----Choose Size----</option>
            {/* Fill out the missing options */}
            <option value="S"> Small </option>
            <option value="M"> Medium </option>
            <option value="L"> Large</option>
          </select>
        </div>
        {errors.size && <div className='error'>{errors.size}</div>}
      </div>

      <div className="input-group">
        {/* 👇 Maybe you could generate the checkboxes dynamically */}
        {toppings.map(topping => <label key={topping.topping_id}>
          <input
            id={topping.topping_id}
            checked={formVals.toppings.includes(topping.topping_id)}
            onChange={onChange}
            name="toppings"
            type="checkbox"
          />
          {topping.text}<br />
        </label>)}
        
      </div>
      {/* 👇 Make sure the submit stays disabled until the form validates! */}
      <input type="submit" disabled = {!submit} />
    </form>
  )
}
