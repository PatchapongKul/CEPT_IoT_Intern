import axios from 'axios';

export default async function getSolarSummary(startDate, endDate) {
    const URL = `http://localhost:3000/api/solar_summary`;

    try {
        const response = await axios.get(URL,{
            params: {
                start: startDate,
                end: endDate,
    }});
        
        return response.data;
    } catch (error) {
        console.error("Error fetching SolarSummary:", error);
        throw new Error("Failed to fetch SolarSummary");
    }
}