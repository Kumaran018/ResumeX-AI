import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../../utils/api'
import './Profile.css'

export default function Profile() {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    jobTitle: '',
    bio: ''
  })
  
  const [isSaved, setIsSaved] = useState(false)

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await api.getMe()
        if (response && response.data && response.data.user) {
          const user = response.data.user
          setFormData(prev => ({
            ...prev,
            firstName: user.name || '',
            email: user.email || '',
            // other fields might not exist in backend yet
          }))
        }
      } catch (e) {
        console.error('Error fetching profile:', e)
      }
    }
    fetchProfile()
  }, [])

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    // Here we would normally send data to a backend
    // For now, let's update local storage
    const userStr = localStorage.getItem('user')
    let user = {}
    if (userStr) {
      try { user = JSON.parse(userStr) } catch(e) {}
    }
    user.name = formData.firstName
    user.lastName = formData.lastName
    user.email = formData.email
    user.jobTitle = formData.jobTitle
    user.bio = formData.bio
    localStorage.setItem('user', JSON.stringify(user))
    
    // Dispatch a custom event so the header and welcome bar can update immediately
    window.dispatchEvent(new Event('user-profile-updated'))
    
    setIsSaved(true)
    setTimeout(() => {
      setIsSaved(false)
      // Navigate back to the dashboard automatically after 1 second
      navigate('/dashboard')
    }, 1000)
  }

  return (
    <div className="profile-page">
      <div className="dashboard-section-title">My Profile</div>
      
      <div className="profile-content-card">
        <form className="profile-form" onSubmit={handleSubmit}>
          
          <div className="form-section">
            <h3 className="form-section-title">Personal Information</h3>
            <div className="form-grid">
              <div className="form-group">
                <label htmlFor="firstName">First Name</label>
                <input 
                  type="text" 
                  id="firstName" 
                  name="firstName" 
                  value={formData.firstName} 
                  onChange={handleChange} 
                  placeholder="e.g. John"
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="lastName">Last Name</label>
                <input 
                  type="text" 
                  id="lastName" 
                  name="lastName" 
                  value={formData.lastName} 
                  onChange={handleChange} 
                  placeholder="e.g. Doe"
                />
              </div>
            </div>
            
            <div className="form-group full-width">
              <label htmlFor="email">Email Address</label>
              <input 
                type="email" 
                id="email" 
                name="email" 
                value={formData.email} 
                onChange={handleChange} 
                placeholder="you@example.com"
                required
              />
            </div>
          </div>

          <div className="form-section">
            <h3 className="form-section-title">Professional Details</h3>
            <div className="form-group full-width">
              <label htmlFor="jobTitle">Target Job Title</label>
              <input 
                type="text" 
                id="jobTitle" 
                name="jobTitle" 
                value={formData.jobTitle} 
                onChange={handleChange} 
                placeholder="e.g. Senior Software Engineer"
              />
            </div>
            <div className="form-group full-width">
              <label htmlFor="bio">Brief Bio</label>
              <textarea 
                id="bio" 
                name="bio" 
                value={formData.bio} 
                onChange={handleChange} 
                placeholder="A short summary of your professional background..."
                rows="4"
              ></textarea>
            </div>
          </div>
          
          <div className="form-actions">
            <button type="submit" className="btn btn-primary">Save Changes</button>
            {isSaved && <span className="save-success">Profile saved successfully!</span>}
          </div>
        </form>
      </div>
    </div>
  )
}
