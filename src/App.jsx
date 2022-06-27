import { useEffect, useState } from 'react'
import { BrowserRouter as Router, Switch, Route, useLocation } from 'react-router-dom'
import routes from '@/router'
import { ConfigProvider } from 'zarm'
import NavBar from '@/components/NavBar'

function App() {
  const location = useLocation();
  const { pathname } = location;
  const needNav = ['/', '/data', '/user'];
  const [ showNav, setShowNav ] = useState(false);
  useEffect(() => {
    setShowNav(needNav.includes(pathname))
  },[pathname])
  return (
    <>
      <ConfigProvider primaryColor={'#007fff'}>
            <Switch>
              {
                routes.map(route => <Route exact key={route.path} path={route.path}>
                  <route.component/>
                </Route>)
              }
            </Switch>
      </ConfigProvider>
        <NavBar showNav={showNav}/>
    </>
  )
}

export default App
