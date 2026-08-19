import { useState, useImperativeHandle, forwardRef } from 'react'

// 1. Wrap the component in forwardRef and accept 'ref' as the second parameter
const Togglable = forwardRef((props, ref) => {
  const [visible, setVisible] = useState(false)

  const hideWhenVisible = { display: visible ? 'none' : '' }
  const showWhenVisible = { display: visible ? '' : 'none' }

  const toggleVisibility = () => {
    setVisible(!visible)
  }

  // 2. Use the 'ref' parameter here instead of props.ref
  useImperativeHandle(ref, () => {
    return {
      toggleVisibility
    }
  })

  return (
    <div>
      <div style={hideWhenVisible}>
        <button onClick={toggleVisibility}>{props.buttonLabel}</button>
      </div>
      <div style={showWhenVisible}>
        {props.children}
        <button onClick={toggleVisibility}>cancel</button>
      </div>
    </div>
  )
})

// 3. (Optional but recommended) Set a display name for React DevTools
Togglable.displayName = 'Togglable'

export default Togglable