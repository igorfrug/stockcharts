import noop from "./noop";
import identity from "./identity";
import { functor } from "./utilIndex";

export default function() {

	let accumulateTill = functor(false),
		accumulator = noop,
		value = identity,
		discardTillStart = false,
		discardTillEnd = false;

	// eslint-disable-next-line prefer-const
	let accumulatingWindow = function(data) {
		let accumulatedWindow = discardTillStart ? undefined : [];
		const response = [];
		let accumulatorIdx = 0;
		let i = 0;
		for (i = 0; i < data.length; i++) {
			const d = data[i];
			// console.log(d, accumulateTill(d));
			if (accumulateTill(d, i, (accumulatedWindow || []))) {
				if (accumulatedWindow && accumulatedWindow.length > 0) response.push(accumulator(accumulatedWindow, i, accumulatorIdx++));
				accumulatedWindow = [value(d)];
			} else {
				if (accumulatedWindow) accumulatedWindow.push(value(d));
			}
		}
		if (!discardTillEnd) response.push(accumulator(accumulatedWindow, i, accumulatorIdx));
		return response;
	};

	accumulatingWindow.accumulateTill = function(x) {
		if (!arguments.length) {
			return accumulateTill;
		}
		accumulateTill = functor(x);
		return accumulatingWindow;
	};
	accumulatingWindow.accumulator = function(x) {
		if (!arguments.length) {
			return accumulator;
		}
		accumulator = x;
		return accumulatingWindow;
	};
	accumulatingWindow.value = function(x) {
		if (!arguments.length) {
			return value;
		}
		value = x;
		return accumulatingWindow;
	};
	accumulatingWindow.discardTillStart = function(x) {
		if (!arguments.length) {
			return discardTillStart;
		}
		discardTillStart = x;
		return accumulatingWindow;
	};
	accumulatingWindow.discardTillEnd = function(x) {
		if (!arguments.length) {
			return discardTillEnd;
		}
		discardTillEnd = x;
		return accumulatingWindow;
	};
	return accumulatingWindow;
}
