/**
 * Sample driver profiles. They only show on development / preview builds while no real
 * drivers are published in the admin, and each card is labelled "Sample profile".
 * The live (production) site never shows them.
 */
export type DriverSeed = {
  name: string;
  city: string;
  experience: number;
  licence: string;
  duty: string;
  drives: string[];
  languages: string[];
  about: string;
};

export const SAMPLE_DRIVERS: DriverSeed[] = [
  { name: "Ramesh K.", city: "Kukatpally", experience: 12, licence: "LMV + Transport", duty: "Local & outstation", drives: ["Car", "SUV", "Tempo traveller"], languages: ["Telugu", "Hindi", "English"], about: "Regular on Hyderabad–Vijayawada and Srisailam routes. Calm, punctual and knows the highway stops well." },
  { name: "Syed Imran", city: "Tolichowki", experience: 9, licence: "LMV", duty: "City & airport", drives: ["Car", "SUV", "Automatic"], languages: ["Urdu", "Hindi", "Telugu", "English"], about: "Airport pickups and corporate city runs. Comfortable with automatic and luxury cars." },
  { name: "Venkatesh P.", city: "Dilsukhnagar", experience: 15, licence: "HMV + Transport", duty: "Outstation & tours", drives: ["Tempo traveller", "Minibus", "Bus"], languages: ["Telugu", "Kannada", "Hindi"], about: "Group tours to Tirupati, Hampi and Araku. Experienced with wedding and pilgrimage groups." },
  { name: "Srinivas Rao", city: "Secunderabad", experience: 8, licence: "LMV + Transport", duty: "Monthly / corporate", drives: ["Car", "SUV"], languages: ["Telugu", "English"], about: "Monthly corporate driver for executives. Neat, discreet and familiar with Hitech City traffic." },
  { name: "Mohammed Aslam", city: "Mehdipatnam", experience: 11, licence: "HMV", duty: "Shifting & goods", drives: ["Pickup", "Truck"], languages: ["Urdu", "Hindi", "Telugu"], about: "House shifting and shop deliveries across the city. Careful with loading and narrow lanes." },
  { name: "Naresh G.", city: "Gachibowli", experience: 6, licence: "LMV", duty: "City & night trips", drives: ["Car", "Automatic"], languages: ["Telugu", "Hindi", "English"], about: "Night drives and party drop-backs in your own car. Smooth driver, good with late-hour routes." },
];
