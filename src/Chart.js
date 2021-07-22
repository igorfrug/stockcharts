import React from "react";
import PropTypes from "prop-types";

import { format } from "d3-format";
import { timeFormat } from "d3-time-format";

import { ChartCanvas, Chart } from "react-stockcharts";
import {
	BarSeries,
	AreaSeries,
	CandlestickSeries,
	LineSeries,
	MACDSeries,
	TriangleMarker
} from "react-stockcharts/lib/series";
import ScatterSeries from './ScatterSeries'
import { XAxis, YAxis } from "react-stockcharts/lib/axes";
import {
	CrossHairCursor,
	EdgeIndicator,
	CurrentCoordinate,
	MouseCoordinateX,
	MouseCoordinateY,
} from "react-stockcharts/lib/coordinates";
import { LabelAnnotation, Annotate } from "react-stockcharts/lib/annotation";
import discontinuousTimeScaleProvider from "./discontinuousTimeScaleProvider";
import {
	OHLCTooltip,
	MovingAverageTooltip,
	MACDTooltip
} from "react-stockcharts/lib/tooltip";
import { ema, heikinAshi, sma } from "react-stockcharts/lib/indicator";
import { fitWidth } from "react-stockcharts/lib/helper";
import { head, last, toObject } from "react-stockcharts/lib/utils";
import PriceCoordinate from "./PriceCoordinate";
import {
	Modal,
	Button,
	FormGroup,
	FormControl,
} from "react-bootstrap";
import { macd } from "react-stockcharts/lib/indicator";
import './Charts.css'
import Forms from './Forms'
import * as helper from "react-stockcharts/lib/helper";
import { TrendLine, DrawingObjectSelector } from "react-stockcharts/lib/interactive";
import {
	saveInteractiveNodes,
	getInteractiveNodes,
} from "./interactiveutils";
import { InteractiveText } from "react-stockcharts/lib/interactive";
import { getMorePropsForChart } from "react-stockcharts/lib/interactive/utils";
import { HoverTooltip } from "react-stockcharts/lib/tooltip";;







const dateFormat = timeFormat("%Y-%m-%d");
const numberFormat = format(".2f");

function tooltipContent(ys) {
	return ({ currentItem, xAccessor }) => {
		return {
			x: dateFormat(xAccessor(currentItem)),
			y: [
				{
					label: "open",
					value: currentItem.open && numberFormat(currentItem.open)
				},
				{
					label: "high",
					value: currentItem.high && numberFormat(currentItem.high)
				},
				{
					label: "low",
					value: currentItem.low && numberFormat(currentItem.low)
				},
				{
					label: "close",
					value: currentItem.close && numberFormat(currentItem.close)
				},
				{
					label: "timestamp",
					value: currentItem.timestamp && numberFormat(currentItem.timestamp)
				}
			]
				.concat(
					ys.map(each => ({
						label: each.label,
						value: each.value(currentItem),
						stroke: each.stroke
					}))
				)
				.filter(line => line.value)
		};
	};
}
const keyValues = ["high", "low"];
class Dialog extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			text: props.text,
		};
		this.handleChange = this.handleChange.bind(this);
		this.handleSave = this.handleSave.bind(this);
	}
	componentWillReceiveProps(nextProps) {
		this.setState({
			text: nextProps.text,
		});
	}
	handleChange(e) {
		this.setState({
			text: e.target.value
		});
	}
	handleSave() {
		this.props.onSave(this.state.text, this.props.chartId);
	}
	render() {
		const {
			showModal,
			onClose,
		} = this.props;
		const { text } = this.state;

		return (
			<Modal className="modal" show={showModal} onHide={onClose} >
				<Modal.Header className="header">
					<Modal.Title className="title" >Enter  text</Modal.Title>
				</Modal.Header>

				<Modal.Body className="modal-body">
					<form>
						<FormGroup controlId="text">
							<FormControl className="input" type="text" value={text} onChange={this.handleChange} />
						</FormGroup>
					</form>
				</Modal.Body>
				<Modal.Footer>
					<Button className="save" onClick={this.handleSave}>Save</Button>
				</Modal.Footer>
			</Modal>
		);
	}
}
const macdAppearance = {
	stroke: {
		macd: "#FF0000",
		signal: "#00F300",
	},
	fill: {
		divergence: "#4682B4"
	},
};
class HeikinAshi extends React.Component {
	constructor(props) {
		super(props);
		this.onKeyPress = this.onKeyPress.bind(this);
		this.onDrawComplete = this.onDrawComplete.bind(this);
		// this.handleChoosePosition = this.handleChoosePosition.bind(this);
		this.onDrawCompleteChart1 = this.onDrawCompleteChart1.bind(this);
		this.onDrawCompleteChart2 = this.onDrawCompleteChart2.bind(this);
		this.saveInteractiveNodes = saveInteractiveNodes.bind(this);
		this.getInteractiveNodes = getInteractiveNodes.bind(this);
		this.handleSelection = this.handleSelection.bind(this);

		this.saveCanvasNode = this.saveCanvasNode.bind(this);
		this.saveCanvasNode1 = this.saveCanvasNode1.bind(this);

		//this.handleDialogClose = this.handleDialogClose.bind(this);
		//this.handleTextChange = this.handleTextChange.bind(this);

		this.state = {
			enableInteractiveObject: false,
			enableTrendLine: false,
			trends_1: [
				{ start: [1606, 56], end: [1711, 53], appearance: { stroke: "green" }, type: "XLINE" }
			],
			trends_2: [],
			textList_1: [],
			textList_3: [],
			showModal: false,
			price1: 0,
			price2: 0,
			condition: '',
			text: '',
			marker: 0
		};
	};
	//for tootlip
	removeRandomValues(data) {
		return data.map(item => {
			const newItem = { ...item };
			const numberOfDeletion =
				Math.floor(Math.random() * keyValues.length) + 1;
			for (let i = 0; i < numberOfDeletion; i += 1) {
				const randomKey =
					keyValues[Math.floor(Math.random() * keyValues.length)];
				newItem[randomKey] = undefined;
			}
			return newItem;
		});
	}

	///from forms
	callbackFunction = (fromForms1, fromForms2, fromForms3, fromForms4, fromForms5, markerParam, markerTimestamp, markerHigh) => {
		console.log(fromForms1, fromForms2, fromForms3, fromForms4, fromForms5, markerTimestamp, markerParam)
		this.setState({
			//enableInteractiveObject: true,
			//enableTrendLine: true,
			trends_1: [
				{ start: [1606, 56], end: [1711, 53], appearance: { stroke: "green" }, type: "XLINE" }
			],
			trends_3: [],
			textList_1: [],
			textList_3: [],
			showModal: false,
			price1: fromForms1,
			price2: fromForms2,
			condition: fromForms3,
			text: fromForms4,
			param: fromForms5,
			markerParam: markerParam,
			markerTimestamp: markerTimestamp,
			markerHigh: markerHigh
		})
		setTimeout(() => {
			console.log(this.state.param, this.state.condition)
			// if (localStorage.getItem("param") === null && localStorage.getItem("condition") === null
			// 	&& localStorage.getItem("text") === null
			// 	&& this.state.param != undefined && this.state.condition != undefined && this.state.text === undefined) {
			// 	console.log("1")
			// 	console.log(this.state.param, this.state.condition, this.state.text)
			// 	localStorage.setItem("param", JSON.stringify(this.state.param))
			// 	localStorage.setItem("condition", JSON.stringify(this.state.condition))
			// 	localStorage.setItem("text", JSON.stringify(this.state.text))
			// } else if (localStorage.getItem("param") != null || localStorage.getItem("condition") != null
			// 	&& localStorage.getItem("text") != null && !localStorage.price1 || !localStorage.price2
			// 	|| !localStorage.marker && this.state.param != undefined && this.state.condition != undefined) {
			// 	console.log("2")
			// 	localStorage.setItem("param", null)
			// 	console.log(localStorage.param)


			// 	localStorage.setItem("condition", null)
			// 	localStorage.setItem("param", JSON.stringify(this.state.param))
			// 	localStorage.setItem("condition", JSON.stringify(this.state.condition))
			// 	localStorage.setItem("text", this.state.text)
				// if (localStorage.price1 != 0) {
				// 	const fromeStorage4 = localStorage.getItem("price1")
				// 	this.state.price1 = JSON.parse(fromeStorage4)
				// 	console.log(this.state.price1)
				//}
			//}
			if(this.state.condition !=undefined && this.state.param !=undefined &&
				this.state.text!=undefined){
					localStorage.setItem("param", JSON.stringify(this.state.param))
			 	localStorage.setItem("condition", JSON.stringify(this.state.condition))
			 	localStorage.setItem("text", JSON.stringify(this.state.text))	
				}
			if (this.state.price1 != 0) {
				localStorage.setItem("price1", JSON.stringify(this.state.price1))
			}
			if (this.state.price2 != 0) {
				localStorage.setItem("price2", JSON.stringify(this.state.price2))
			}
		}, 50);

	};
	///for textbox
	saveCanvasNode(node) {
		this.canvasNode = node;
	}

	///for lines
	saveCanvasNode1(node1) {
		this.canvasNode1 = node1;
	}
	handleSelection(interactives, moreProps, e) {
		///for textbox
		// if (this.state.enableInteractiveObject) {
		// 	const independentCharts = moreProps.currentCharts.filter(d => d !== 2)
		// 	if (independentCharts.length > 0) {
		// 		const first = head(independentCharts);

		// 		const morePropsForChart = getMorePropsForChart(moreProps, first)
		// 		const {
		// 			mouseXY: [, mouseY],
		// 			chartConfig: { yScale },
		// 			xAccessor,
		// 			currentItem,
		// 		} = morePropsForChart;

		// 		const position = [xAccessor(currentItem), yScale.invert(mouseY)];
		// 		const newText = {
		// 			...InteractiveText.defaultProps.defaultText,
		// 			position,
		// 		};
		// 		this.handleChoosePosition(newText, morePropsForChart, e);
		// 	}
		// } else {
		// 	const state = toObject(interactives, each => {
		// 		return [
		// 			`textList_${each.chartId}`,
		// 			each.objects,
		// 		];
		// 	});
		// 	this.setState(state);
		// }
		//// for lines
		if (this.setState.enableTrendLine) {
			const state1 = toObject(interactives, each => {
				return [
					`trends_${each.chartId}`,
					each.objects,
				];
			});
			this.setState(state1);
		}
	}


	// handleChoosePosition(text, moreProps) {
	// 	this.componentWillUnmount();
	// 	const { id: chartId } = moreProps.chartConfig;

	// 	this.setState({
	// 		[`textList_${chartId}`]: [
	// 			...this.state[`textList_${chartId}`],
	// 			text
	// 		],
	// 		showModal: true,
	// 		text: text.text,
	// 		chartId
	// 	});
	// }
	//for lines
	onDrawCompleteChart1(trends_1) {
		// this gets called on
		// 1. draw complete of trendline
		// 2. drag complete of trendline
		console.log(trends_1);
		this.setState({
			enableTrendLine: false,
			trends_1
		});
	}
	//for lines
	onDrawCompleteChart2(trends_2) {
		// this gets called on
		// 1. draw complete of trendline
		// 2. drag complete of trendline
		console.log(trends_2);
		this.setState({
			enableTrendLine: false,
			trends_2
		});
	}
	//for textbox
	// handleTextChange(text, chartId) {
	// 	const textList = this.state[`textList_${chartId}`];
	// 	const allButLast = textList
	// 		.slice(0, textList.length - 1);

	// 	const lastText = {
	// 		...last(textList),
	// 		text,
	// 	};

	// 	this.setState({
	// 		[`textList_${chartId}`]: [
	// 			...allButLast,
	// 			lastText
	// 		],
	// 		showModal: false,
	// 		enableInteractiveObject: false,

	// 	});
	// 	this.componentDidMount();
	// }
	// handleDialogClose() {
	// 	this.setState({
	// 		showModal: false,
	// 	});
	// 	this.componentDidMount();
	// }

	componentDidMount() {

		if (localStorage.getItem("param") != null || localStorage.getItem("condition") != null) {
			console.log("11")
			const fromStorage1 = localStorage.getItem("param")
			console.log(fromStorage1)
			if (localStorage.param != "undefined") { this.state.param = JSON.parse(fromStorage1) }
			const fromStorage2 = localStorage.getItem("condition")
			console.log(fromStorage2)
			this.state.condition = JSON.parse(fromStorage2)
			const fromStorage3 = localStorage.getItem("text")
			this.state.text = fromStorage3
			console.log(this.state.param, this.state.condition,this.state.text)
		}


		if (localStorage.price1) {
			const fromeStorage4 = localStorage.getItem("price1")
			this.state.price1 = JSON.parse(fromeStorage4)
			console.log(this.state.price1)
		}
		if (localStorage.price2) {
			const fromeStorage5 = localStorage.getItem("price2")
			this.state.price2 = JSON.parse(fromeStorage5)
		}
		document.addEventListener("keyup", this.onKeyPress)
	}

	componentWillUnmount() {
		document.removeEventListener("keyup", this.onKeyPress);
	}
	//for textbox
	onDrawComplete(textList, moreProps) {
		// this gets called on
		// 1. draw complete of drawing object
		// 2. drag complete of drawing object
		const { id: chartId } = moreProps.chartConfig;

		this.setState({
			enableInteractiveObject: false,
			[`textList_${chartId}`]: textList,
		});
	}
	onKeyPress(e) {
		const keyCode = e.which;
		console.log(keyCode);
		switch (keyCode) {
			case 46: {
				// DEL for lines
				const trends_1 = this.state.trends_1
					.filter(each => !each.selected);
				const trends_2 = this.state.trends_2
					.filter(each => !each.selected);

				//this.canvasNode.cancelDrag();

				this.setState({
					trends_1,
					trends_2,
				});
				break;
			}
			// case 46: {
			// 	// DEL for textbox
			// 	this.setState({
			// 		textList_1: this.state.textList_1.filter(d => !d.selected),
			// 		textList_3: this.state.textList_3.filter(d => !d.selected)
			// 	});

			// 	break;
			//}
			// case 27: {
			// 	//ESC for textbox
			// 	//this.node.terminate();
			// 	//this.canvasNode.cancelDrag();
			// 	this.setState({
			// 		enableInteractiveObject: false
			// 	});
			// };
			case 27: {
				// ESC for lines
				//this.node_1.terminate();
				//this.node_2.terminate();
				//this.canvasNode.cancelDrag();
				this.setState({
					enableTrendLine: false
				});
				break;
			};
			// default:
			// 	console.log("default")
			// 	 this.setState({
			// 		enableInteractiveObject: false,
			// 	 	enableTrendLine:false
			// 	 });
		};
	};
	// Draw Mode for textbox
	// DrawModeOn() {
	// 	this.setState({
	// 		enableInteractiveObject: true,
	// 		enableTrendLine: false
	// 	});
	// };
	//Draw Mode gor lines
	DrawModeLine() {
		this.setState({
			enableTrendLine: true,
			//enableInteractiveObject: false
		});
	};
	render() {
		let { type, data: initialData, width, ratio } = this.props;


		const ha = heikinAshi();
		//trendLine
		const ema26 = ema()
			.id(0)
			.options({ windowSize: 26 })
			.merge((d, c) => { d.ema26 = c; })
			.accessor(d => d.ema26);

		const ema12 = ema()
			.id(1)
			.options({ windowSize: 12 })
			.merge((d, c) => { d.ema12 = c; })
			.accessor(d => d.ema12);
		////////////////////////////interactive textbox
		const ema20 = ema()
			.id(0)
			.options({ windowSize: 20 })
			.merge((d, c) => { d.ema20 = c; })
			.accessor(d => d.ema20);

		const ema50 = ema()
			.id(2)
			.options({ windowSize: 50 })
			.merge((d, c) => { d.ema50 = c; })
			.accessor(d => d.ema50);

		const smaVolume50 = sma()
			.id(3)
			.options({ windowSize: 50, sourcePath: "volume" })
			.merge((d, c) => { d.smaVolume50 = c; })
			.accessor(d => d.smaVolume50);

		const macdCalculator = macd()
			.options({
				fast: 12,
				slow: 26,
				signal: 9,
			})
			.merge((d, c) => { d.macd = c; })
			.accessor(d => d.macd);

		// //Modal-interactive text
		// const { showModal, text } = this.state;

		const calculatedData = smaVolume50(ema50(ema20(ha(ema12(ema26(macdCalculator(initialData)))))));

		const xScaleProvider = discontinuousTimeScaleProvider
			.inputDateAccessor(d => d.date);


		const {
			data,
			xScale,
			xAccessor,
			displayXAccessor,
		} = xScaleProvider(calculatedData);
		console.log(data)
		const start = xAccessor(last(data));
		const end = xAccessor(data[Math.max(0, data.length - 150)]);
		const xExtents = [start, end];


		const markerParam = this.state.markerParam
		const markerTimestamp = this.state.markerTimestamp
		const markerHigh = this.state.markerHigh
		console.log(markerTimestamp, markerHigh)
		console.log(this.state.condition)
		const condition = Number(this.state.condition)
		console.log(typeof (condition))
		const param = this.state.param
		const boxText = this.state.text
		console.log(param, condition,boxText)
		console.log(typeof (param))

		const annotationProps = {
			fontFamily: "Glyphicons Halflings",
			fontSize: 30,
			fill: "blue",
			opacity: 0.8,
			text: "\ue182",
			y: ({ yScale }) => yScale.range()[1],
			tooltip: d => d ? boxText : ""/* some condition */,
		};
		return (
			<div className="charts">
				<h1>MY DATA</h1>

				<ChartCanvas height={400}

					ratio={ratio}
					width={width}
					margin={{ left: 80, right: 80, top: 30, bottom: 30 }}
					type={type}
					seriesName="MSFT"
					data={data}
					xScale={xScale}
					xAccessor={xAccessor}
					displayXAccessor={displayXAccessor}
					xExtents={xExtents}
				>
					<Chart id={1}
						yExtents={[d => [d.high, d.low, d.open, d.close], ema20.accessor(), ema50.accessor()]}
						xExtents={d => d.date}
						padding={{ top: 20, bottom: 20 }}
					>
						<XAxis axisAt="bottom" orient="bottom" />
						<YAxis axisAt="right" orient="right" ticks={5} />
						<MouseCoordinateY
							at="right"
							orient="right"
							displayFormat={format(".1f")} />

						<CandlestickSeries />
						<LineSeries yAccessor={ema20.accessor()} stroke={ema20.stroke()} />
						<LineSeries yAccessor={ema50.accessor()} stroke={ema50.stroke()} />

						<CurrentCoordinate yAccessor={ema20.accessor()} fill={ema20.stroke()} />
						<CurrentCoordinate yAccessor={ema50.accessor()} fill={ema50.stroke()} />

						<EdgeIndicator itemType="last" orient="right" edgeAt="right"
							yAccessor={ema20.accessor()} fill={ema20.fill()} />
						<EdgeIndicator itemType="last" orient="right" edgeAt="right"
							yAccessor={ema50.accessor()} fill={ema50.fill()} />
						<EdgeIndicator itemType="last" orient="right" edgeAt="right"
							yAccessor={d => d.close} fill={d => d.close > d.open ? "#6BA583" : "#FF0000"} />
						<EdgeIndicator itemType="first" orient="left" edgeAt="left"
							yAccessor={ema20.accessor()} fill={ema20.fill()} />
						<EdgeIndicator itemType="first" orient="left" edgeAt="left"
							yAccessor={ema50.accessor()} fill={ema50.fill()} />
						<EdgeIndicator itemType="first" orient="left" edgeAt="left"
							yAccessor={d => d.close} fill={d => d.close > d.open ? "#6BA583" : "#FF0000"} />

						<OHLCTooltip origin={[-40, 0]} />
						<MovingAverageTooltip
							onClick={e => console.log(e)}
							origin={[-38, 15]}
							options={[
								{
									yAccessor: ema20.accessor(),
									type: "EMA",
									stroke: ema20.stroke(),
									windowSize: ema20.options().windowSize,
								},
								{
									yAccessor: ema50.accessor(),
									type: "EMA",
									stroke: ema50.stroke(),
									windowSize: ema50.options().windowSize,
								},
							]}
						/>
						<MACDSeries yAccessor={d => d.macd}
							{...macdAppearance} />
						{/* {<Dialog
							showModal={showModal}
							text={text}
							chartId={this.state.chartId}
							onClose={this.handleDialogClose}
							onSave={this.handleTextChange}
						/>
						<InteractiveText
							ref={this.saveInteractiveNodes("InteractiveText", 1)}
							enabled={this.state.enableInteractiveObject}
							text="Lorem ipsum..."
							onDragComplete={this.onDrawComplete}
							textList={this.state.textList_1}
						/>} */}
						{param === "timestamp" && <Annotate with={LabelAnnotation}
							{...console.log(param, condition)}
							when={d => d.timestamp === condition   /* some condition */}
							usingProps={annotationProps} />}
						{param === "open>" && <Annotate with={LabelAnnotation}
							when={d => d.open > condition   /* some condition */}
							usingProps={annotationProps} />}
						{param === "open<" && <Annotate with={LabelAnnotation}
							when={d => d.open < condition   /* some condition */}
							usingProps={annotationProps} />}
						{param === "close>" && <Annotate with={LabelAnnotation}
							when={d => d.close > condition   /* some condition */}
							usingProps={annotationProps} />}
						{param === "close<" && <Annotate with={LabelAnnotation}
							when={d => d.close < condition   /* some condition */}
							usingProps={annotationProps} />}
						{param === "high>" && <Annotate with={LabelAnnotation}
							when={d => d.high > condition   /* some condition */}
							usingProps={annotationProps} />}
						{param === "high<" && <Annotate with={LabelAnnotation}
							when={d => d.high < condition   /* some condition */}
							usingProps={annotationProps} />}
						{param === "low>" && <Annotate with={LabelAnnotation}
							when={d => d.low > condition   /* some condition */}
							usingProps={annotationProps} />}
						{param === "low<" && <Annotate with={LabelAnnotation}
							when={d => d.low < condition   /* some condition */}
							usingProps={annotationProps} />}
						<PriceCoordinate
							at="right"
							orient="right"
							price={JSON.parse(this.state.price1)}
							stroke="#3490DC"
							strokeWidth={2}
							fill="#FFFFFF"
							textFill="#22292F"
							arrowWidth={7}
							displayFormat={format(".2f")}
						/>,
						<PriceCoordinate
							at="right"
							orient="right"
							price={JSON.parse(this.state.price2)}
							stroke="#3490DC"
							strokeWidth={2}
							fill="#FFFFFF"
							textFill="#22292F"
							arrowWidth={7}
							strokeDasharray="ShortDash"
							displayFormat={format(".2f")}
						/>
						<TrendLine
							ref={this.saveInteractiveNodes("Trendline", 1)}
							enabled={this.state.enableTrendLine}
							type="RAY"
							snap={false}
							snapTo={d => [d.high, d.low]}
							onStart={() => console.log("START")}
							onComplete={this.onDrawCompleteChart1}
							trends={this.state.trends_1}
						/>


						//{markerParam === "timestamp" && markerTimestamp ?
							<ScatterSeries
								xAccessor={d => d.timestamp}
								yAccessor={d => d.low}
								marker={TriangleMarker}
								markerProps={{ width: 8, stroke: "#2ca02c", fill: "#2ca02c" }}
							/> : ""
						}
						{markerHigh === "high" ?
							<ScatterSeries
								yAccessor={d => d.high}
								when={d => d.low < 38700  /* some condition */}
								marker={TriangleMarker}
								markerProps={{ width: 8, stroke: "#2ca02c", fill: "red" }}
							/> : ""
						}
						<HoverTooltip
							yAccessor={ema50.accessor()}
							tooltipContent={tooltipContent([
								{
									label: `${ema20.type()}(${ema20.options()
										.windowSize})`,
									value: d => numberFormat(ema20.accessor()(d)),
									stroke: ema20.stroke()
								},
								{
									label: `${ema50.type()}(${ema50.options()
										.windowSize})`,
									value: d => numberFormat(ema50.accessor()(d)),
									stroke: ema50.stroke()
								}
							])}
							fontSize={15}
						/>

					</Chart>
					<Chart id={2}
						yExtents={[d => d.volume, smaVolume50.accessor()]}
						height={150} origin={(w, h) => [0, h - 150]}
					>
						<YAxis axisAt="left" orient="left" ticks={1} tickFormat={format(".1s")} />
						<MouseCoordinateX
							at="bottom"
							orient="bottom"
							displayFormat={timeFormat("%S%L")}
						/>
						<MouseCoordinateY
							at="left"
							orient="left"
							displayFormat={format(".4s")} />

						<BarSeries yAccessor={d => d.volume} fill={d => d.close > d.open ? "#6BA583" : "#FF0000"} />
						{/* <AreaSeries yAccessor={smaVolume50.accessor()} stroke={smaVolume50.stroke()} fill={smaVolume50.fill()} />

						<CurrentCoordinate yAccessor={smaVolume50.accessor()} fill={smaVolume50.stroke()} /> */}
						<CurrentCoordinate yAccessor={d => d.volume} fill="#9B0A47" />

						<EdgeIndicator itemType="first" orient="left" edgeAt="left"
							yAccessor={d => d.volume} displayFormat={format(".4s")} fill="#0F0F0F" />
						<EdgeIndicator itemType="last" orient="right" edgeAt="right"
							yAccessor={d => d.volume} displayFormat={format(".4s")} fill="#0F0F0F" />
						<EdgeIndicator itemType="first" orient="left" edgeAt="left"
							yAccessor={smaVolume50.accessor()} displayFormat={format(".4s")} fill={smaVolume50.fill()} />
						<EdgeIndicator itemType="last" orient="right" edgeAt="right"
							yAccessor={smaVolume50.accessor()} displayFormat={format(".4s")} fill={smaVolume50.fill()} />
						<TrendLine
							ref={this.saveInteractiveNodes("Trendline", 3)}
							enabled={this.state.enableTrendLine}
							type="RAY"
							snap={false}
							snapTo={d => [d.high, d.low]}
							onStart={() => console.log("START")}
							onComplete={this.onDrawCompleteChart3}
							trends={this.state.trends_3}
						/>

					</Chart>
					<CrossHairCursor />
					<DrawingObjectSelector
						enabled
						getInteractiveNodes={this.getInteractiveNodes}
						drawingObjectMap={{
							InteractiveText: "textList"
						}}
						onSelect={this.handleSelection}
					/>
				</ChartCanvas>

				<div className="text-content">
					{/* <div
						className="instructions-interactive-text">
						<h3>Interactive text instructions</h3>
						<p>Click this button to enable drawing mode</p>	<button onClick={e => this.DrawModeOn(e)}>Draw</button>
						<ul>
							<li>create a fan - click</li>
							<li>Edit the text and save.</li>
							<li>To get back into draw mode again -click "Draw" again.</li>
							<li>Delete the last text - Press DEL.</li>
							<li>Delete any text - click on it, then press DEL</li>
							<li>When not in draw mode: move mouse over to hover state, click to select drag.</li>
						</ul>
					</div> */}
					<div className="instructions-tradeline">
						<h3>Tradeline Instructions</h3>
						<p>Click this button to enable drawing mode</p>	<button onClick={e => this.DrawModeLine(e)}>Draw Line</button>

						<ul>
							<li>create a line - click,mousemove,click
								By default the line edge snaps to the nearest high or low, press Shift when you click to disable snap temporarily.
							</li>
							<li>Once a line is drawn it gets out of draw mode automatically.</li>
							<li>To get back into draw mode again -click "Draw Line" button again.</li>
							<li>Delete the last drawn line - Press DEL.</li>
							<li>Get out of draw mode - Press ESC</li>
							<li>When not in draw mode: hover and click to select, move the line or edges,click outside to unselect.</li>
						</ul>
					</div>

					<div className="forms">
						<Forms parentCallBack={this.callbackFunction} />
					</div>
				</div>
			</div>
		);


	}


}

HeikinAshi.propTypes = {
	data: PropTypes.array.isRequired,
	width: PropTypes.number.isRequired,
	ratio: PropTypes.number.isRequired,
	type: PropTypes.oneOf(["svg", "hybrid"]).isRequired,
};

HeikinAshi.defaultProps = {
	type: "svg",
};

HeikinAshi = fitWidth(HeikinAshi);

export default HeikinAshi;