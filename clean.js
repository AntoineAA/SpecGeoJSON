'use strict';

const fs = require('fs');
const rewind = require('@mapbox/geojson-rewind');

const { GeoJSONFile } = require('./config.json');

const clean = function (geometry) {
	return rewind(geometry, false);
};

const countPointsInNestedArrays = function (array) {
	let total = 0;
	for (const item of array) {
		if (Array.isArray(item)) {
			if (item.length === 2 && typeof item[0] === 'number' && typeof item[1] === 'number') {
				total++;
			} else {
				total += countPointsInNestedArrays(item);
			}
		}
	}
	return total;
};

const getStats = function (featureCollection) {
	console.log('\ttype', featureCollection.type);
	console.log('\tfeatures', featureCollection.features.length);

	let countPoints = 0;

	for (const feature of featureCollection.features) {
		const cntPoints = countPointsInNestedArrays(feature.geometry.coordinates);
		countPoints += cntPoints;
		// console.log(
		// 	`\t\t${feature.type}::${feature.geometry.type}[]${feature.geometry.coordinates.length}`,
		// 	cntPoints
		// );
	}

	console.log('\tpoints', countPoints);
};

(async () => {
	if (!fs.existsSync(GeoJSONFile)) {
		throw new Error(`File ${GeoJSONFile} not found`);
	}

	let data = JSON.parse(fs.readFileSync(GeoJSONFile));

	console.log('INPUT');
	getStats(data);

	for (const feature of data.features) {
		feature.geometry = clean(feature.geometry);
	}

	console.log('OUTPUT');
	getStats(data);
	fs.writeFileSync(GeoJSONFile + '_new', JSON.stringify(data, null, '\t'));
})();
