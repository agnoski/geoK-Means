$(document).ready(function() {
	runApp();
});

function runApp() {
	console.log("Ready!")
}

function processAddresses() {
	const addressesListText = $("#addressesList").val();
	console.log(addressesListText);
	const addressesList = addressesListText.split("\n");
	console.log(addressesList);
	const addresses = addressesList.map(address => address.split(","))
									.filter(parts => parts.length === 3)
									.map(element => {
										return {street: element[0], number: element[1], city: element[2]};
									});

	console.log(addresses);

	const url = "https://geocode.xyz/";
	addresses.forEach( address => {
		let urlReq = `${url}${address.street},${address.number}+${address.city}?json=1`;
		console.log(urlReq);
		$.getJSON(urlReq, data => console.log(data));
	});
}