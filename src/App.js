import { BrowserRouter as Router, Route, Switch, Redirect } from 'react-router-dom'
import  Chart  from './Chart';
import './App.css';


function App() {
  return (
    <div className="App">
      <header className="App-header">
       <h1>FROG's STATISTICS</h1>
      </header>
      <Router >
           
            <Switch>
                <Route path='/home' exact component={Chart} />
               
                {/* <Route path='/displayguest' component={DisplayGuest} />
                <Route path='/displayadmin' component={DisplayAdmin} />
                <Route path='/addeditformadmin' component={AddEditFormAdmin} />
                <Route path='/statistics'  component={Statistics} /> */}
                <Redirect from="/" to="/home" />
            </Switch> 
        </Router >
    </div>
  );
}

export default App;
