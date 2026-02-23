// mockPartnerHospitals.js

export const mockPartnerHospitals = [
    // Lagos State
    { id: 'h1', name: 'Evercare Hospital', state: 'Lagos', lga: 'Lekki', address: '1 Bisola Durosinmi Etti Drive, Lekki Phase 1', distance: '1.2km' },
    { id: 'h2', name: 'Reddington Hospital', state: 'Lagos', lga: 'Victoria Island', address: '12 Idowu Taylor St, Victoria Island', distance: '3.4km' },
    { id: 'h3', name: 'Lagoon Hospitals', state: 'Lagos', lga: 'Ikoyi', address: '17B Bourdillon Rd, Ikoyi', distance: '2.1km' },
    { id: 'h4', name: 'St. Nicholas Hospital', state: 'Lagos', lga: 'Lagos Island', address: '57 Campbell St, Lagos Island', distance: '4.5km' },
    { id: 'h5', name: 'Ifako Ijaiye General Hospital', state: 'Lagos', lga: 'Ifako-Ijaiye', address: 'College Road, Ogba', distance: '1.5km' },
    { id: 'h6', name: 'Gbagada General Hospital', state: 'Lagos', lga: 'Kosofe', address: 'Gbagada Phase 1', distance: '5.2km' },
    { id: 'h7', name: 'Ikeja Medical Centre', state: 'Lagos', lga: 'Ikeja', address: '11 Allen Avenue, Ikeja', distance: '2.8km' },

    // Abuja (FCT)
    { id: 'h8', name: 'Nisa Premier Hospital', state: 'FCT', lga: 'Abuja Municipal', address: 'Amigo Supermarket area, Wuse 2', distance: '2.5km' },
    { id: 'h9', name: 'Cedarcrest Hospitals', state: 'FCT', lga: 'Abuja Municipal', address: '2 Sam Mbakwe St, Gudu', distance: '4.1km' },
    { id: 'h10', name: 'Kelina Hospital', state: 'FCT', lga: 'Abuja Municipal', address: 'Gwarinpa Estate', distance: '3.0km' },

    // Rivers State
    { id: 'h11', name: 'Save a Life Mission Hospital', state: 'Rivers', lga: 'Port Harcourt', address: '34 Stadium Road, Port Harcourt', distance: '1.8km' },
    { id: 'h12', name: 'Braitwaite Memorial Specialist Hospital', state: 'Rivers', lga: 'Port Harcourt', address: 'Forces Avenue, Old GRA', distance: '3.2km' },

    // Oyo State
    { id: 'h13', name: 'University College Hospital (UCH)', state: 'Oyo', lga: 'Ibadan North', address: 'Queen Elizabeth Road, Oritamefa', distance: '4.0km' },
    { id: 'h14', name: 'Molly Specialist Hospital', state: 'Oyo', lga: 'Ibadan South West', address: 'Idi-Ishin, Jericho', distance: '2.2km' }
];

export const getSuggestedHospitals = (state, lgaOrCity) => {
    if (!state) return [];

    // Filter by state first
    const stateHospitals = mockPartnerHospitals.filter(h => h.state.toLowerCase() === state.toLowerCase());

    // Try to find closest by LGA/City
    if (lgaOrCity) {
        const lgaHospitals = stateHospitals.filter(h =>
            h.lga.toLowerCase() === lgaOrCity.toLowerCase() ||
            h.lga.toLowerCase().includes(lgaOrCity.toLowerCase()) ||
            lgaOrCity.toLowerCase().includes(h.lga.toLowerCase())
        );
        if (lgaHospitals.length > 0) {
            return lgaHospitals.slice(0, 3);
        }
    }

    // Fallback to top 3 in the state
    return stateHospitals.slice(0, 3);
};
