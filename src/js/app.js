$(document).ready(function() {
	runApp();
});

function runApp() {
	console.log("Ready!")
}

function processAddresses() {
	const addressesListText = $("#addressesList").val();
	const addressesList = addressesListText.split("\n");
	const addresses = addressesList.map(address => address.split(","))
									.filter(parts => parts.length === 3)
									.map(element => {
										return {street: element[0], number: element[1], city: element[2]};
									});

	const url = "https://geocode.xyz/";

	const urlReqs = addresses.map(address => `${url}${address.street},${address.number}+${address.city}?json=1`);
	console.log(urlReqs);
	const urlReqPromises = urlReqs.map(urlReq => $.getJSON(urlReq));
	Promise.all(urlReqPromises).then(res => console.log(res)).catch(error => console.log(error));
}