import React from "react";



export default class Forms extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            price1: 0,
            price2: 0,
            condition: '',
            text: '',
            marker:0
        }

    }

    sendData = (e) => {
        e.preventDefault()
        const fromForms1 = this.state.price1
        const fromForms2 = this.state.price2
        const fromForms3 = this.state.condition
        const fromForms4 = this.state.text
        const fromForms5= this.state.param
        const markerParam=this.state.markerParam
        const markerTimestamp=this.state.markerTimestamp
        const markerHigh=this.state.markerHigh
        this.props.parentCallBack(fromForms1, fromForms2, fromForms3,fromForms4,fromForms5,markerParam,markerTimestamp,markerHigh);
        console.log(fromForms1, fromForms2, fromForms3,fromForms4,fromForms5)
    }

    render() {
        return (
            <div className="lines">
                <form>
                    <h3>Y-line (Price 1) coordinates</h3>
                    <input type="text" onChange={e => this.setState({ price1: e.target.value })} placeholder='Enter price 1' className="price1-input" />
                    <button onClick={e => this.sendData(e)}>Draw</button>
                </form>

                <form>
                    <h3>Y-line (Price 2) coordinates</h3>
                    <input type="text" onChange={e => this.setState({ price2: e.target.value })} placeholder='Enter price 2' className="price2-input" />
                    <button onClick={e => this.sendData(e)}>Draw</button>
                </form>
               {/* <form>
                    <h3>Marker (d.low) coordinates</h3>
                    <input type="text" onChange={e => this.setState({ markerParam: e.target.value })} placeholder='Enter parameter' className="condition-input" />
                    <input type="text" onChange={e => this.setState({markerTimestamp:e.target.value})}  placeholder='Enter marker' className="marker-input"  />
                    <button onClick={e=>this.sendData(e)}>Draw</button>
                </form>
                <form>
                    <h3>Marker (d.high) coordinates</h3>
                    <input type="text" onChange={e => this.setState({markerHigh:e.target.value})}  placeholder='Enter marker' className="marker-input"  />
                    <button onClick={e=>this.sendData(e)}>Draw</button>
                </form> */}
                <h3>Text Box configuration</h3>
                <form onSubmit={e => this.sendData(e)}>
                    <input type="text" onChange={e => this.setState({ param: e.target.value })} placeholder='Enter parameter' className="condition-input" />
                    <input type="text" onChange={e => this.setState({ condition: e.target.value })} placeholder='Enter  value' className="condition-input" value={this.state.condition}/>
                    <input type="text" onChange={e => this.setState({ text: e.target.value })} placeholder='Enter your text' className="text input-input" />
                    <button type="submit">Draw</button>
                </form>
            </div>
        )
    }
}
