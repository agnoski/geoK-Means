$(document).ready(function() {
	runApp();
});

function runApp() {
	console.log("Ready!")
}

const url = "https://geocode.xyz/";
const clusters = 2;
const delay = 1500;

const splitCSVAddress = addressText => addressText.split(",");
const validateAddress = address => address.length === 3;
const generateAddressObject = element => {
	const address = {};
	[address.street, address.number, address.city] = element;
	return address;
};
const formatUrlReq = address => `${url}${address.street},${address.number}+${address.city}?json=1`;

const getClusterList = (assignments, adresses) => {
	const clustersList = [];
	assignments.forEach((c, i) => {
		if(clustersList[c] === undefined) {
			clustersList[c] = [];
		}
		clustersList[c].push(adresses[i]);
	});
	return clustersList;
}

const appendCluterslistHTML = (clustersList) => {
	clustersList.forEach((clusterElem, index) => {
		$("#clustersList").append(`<li id="cluster_${index}">Cluster ${index}`);
		$(`#cluster_${index}`).append(`<ul id="clusterUL_${index}"></ul>`);

		clusterElem.forEach(c => {
			$(`#clusterUL_${index}`).append(`<li>${c["standard"]["addresst"]}</li>`);
		});
		$("#clustersList").append(`</li>`);
	});
}

function processAddresses() {
	const addressesListText = $("#addressesList").val();
	const addressesList = addressesListText.split("\n");
	const addresses = addressesList.map(splitCSVAddress)
									.filter(validateAddress)
									.map(generateAddressObject);

	const urlReqs = addresses.map(formatUrlReq);
	console.log(urlReqs);

	const urlReqTimesPromise = urlReqs.map((urlReq, i) => {
		return new Promise(resolve => setTimeout(resolve, i*delay)).then(() => {
			console.log(`json call: ${urlReq}`);
			return $.getJSON(urlReq);
		});
	});

	Promise.all(urlReqTimesPromise).then(res => {
		console.log("Success");
		console.log(res);
		var coords = res.map(data => [parseFloat(data.latt), parseFloat(data.longt)]);	
		var kmeans = new KMeans({
			canvas: document.getElementById('plot'),
			data: coords,
			k: clusters
		});
		console.log(kmeans.getAssignments());
		console.log(kmeans.getMeans());

		const clustersList = getClusterList(kmeans.getAssignments(), res);
		console.log(clustersList);

		appendCluterslistHTML(clustersList);
	}).catch(error => {
		console.log("Error");
		console.log(error);
		alert(error.responseText);
	});
}