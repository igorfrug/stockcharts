import React from 'react';
import { render } from 'react-dom';
import Chart from './Chart';
import { getData } from "./utils"
import { TypeChooser } from "react-stockcharts/lib/helper";
import { setTimeout } from 'timers';


class ChartComponent extends React.Component {
	componentDidMount() {
		// Calling getData() and creating the initial state.
		console.log("hey 3")
		getData().then(data => {
			this.setState({ data });
			console.log(this.state.data)
		});
		setTimeout(() => {
			const index = async () => {
				console.log("set timeout")
				try {
					const data = await getData();
					console.log(data)
					//Comparing new data with existing state. Identical elements are moved into a new array called dataArr.
					let dataArr = [];
					for (let d of data) {
						for (let sd of this.state.data) {
							if (d.low === sd.low && d.high === sd.high && d.open === sd.open
								&& d.close === sd.close) { dataArr.push(d) }
						};
					};
					console.log(dataArr.length);
					console.log(this.state.data.length);
					//comparing the length of dataArr with the kength of the previous state.
					// if they are the same - no changes between the new and the previouas data => the state is not being updated.
					// If the lengths are different - new state is longer than dataArr as it includes some  data  wich is not identical to the previous state data => the state is being updated.
					if (dataArr.length < this.state.data.length) {
						this.setState({ data });
						dataArr = null;
						console.log("new state", this.state.data);
						setTimeout(function () { index() }, 5000);		
					} else {
						console.log("again");
						setTimeout(function () { index() }, 5000);		
					}
				} catch (err) {
					console.log(err);
				}	
			};
			//Calling  API again after 5 seconds.
			setTimeout(function () { index() }, 5000);		
		}, 5000);	
	};



	render() {
		if (this.state == null) {
			return <div>Loading...</div>
		}
		return (
			<TypeChooser>
				{type => <Chart type={type} data={this.state.data} />}
			</TypeChooser>
		)
	};


	
		
};

render(
	<ChartComponent />,
	document.getElementById("root")
);
