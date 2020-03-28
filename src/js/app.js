$(document).ready(function() {
	runApp();
});

function runApp() {
	console.log("Ready!")
}

const url = "https://geocode.xyz/";
const clusters = 2;

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

function processAddresses() {
	const addressesListText = $("#addressesList").val();
	const addressesList = addressesListText.split("\n");
	const addresses = addressesList.map(splitCSVAddress)
									.filter(validateAddress)
									.map(generateAddressObject);

	const urlReqs = addresses.map(formatUrlReq);
	console.log(urlReqs);
	const urlReqPromises = urlReqs.map(urlReq => $.getJSON(urlReq));
	Promise.all(urlReqPromises).then(res => {
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
	}).catch(error => console.log(error));
}