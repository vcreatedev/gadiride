/** Cities and major towns offered in every location dropdown, grouped by state. */
export const STATE_CITIES: { state: string; cities: string[] }[] = [
  {
    state: "Telangana",
    cities: [
      "Hyderabad", "Secunderabad", "Warangal", "Hanamkonda", "Karimnagar", "Nizamabad", "Khammam", "Ramagundam",
      "Mahabubnagar", "Nalgonda", "Adilabad", "Suryapet", "Siddipet", "Miryalaguda", "Jagtial", "Mancherial",
      "Kothagudem", "Bhadrachalam", "Sangareddy", "Medak", "Kamareddy", "Nirmal", "Wanaparthy", "Jogulamba Gadwal",
      "Nagarkurnool", "Vikarabad", "Jangaon", "Bhongir", "Mahabubabad", "Peddapalli", "Sircilla", "Bhupalpally",
      "Mulugu", "Narayanpet", "Asifabad", "Medchal", "Shamshabad", "Bodhan", "Zaheerabad", "Tandur", "Kodad",
      "Bellampalli", "Koratla", "Metpally", "Armoor", "Huzurabad", "Sathupalli", "Yellandu",
    ],
  },
  {
    state: "Andhra Pradesh",
    cities: [
      "Visakhapatnam", "Vijayawada", "Guntur", "Nellore", "Kurnool", "Rajahmundry", "Kakinada", "Tirupati", "Kadapa",
      "Anantapur", "Eluru", "Ongole", "Vizianagaram", "Srikakulam", "Machilipatnam", "Chittoor", "Nandyal",
      "Bhimavaram", "Tenali", "Proddatur", "Hindupur", "Adoni", "Madanapalle", "Guntakal", "Dharmavaram", "Gudivada",
      "Narasaraopet", "Tadipatri", "Chilakaluripet", "Amalapuram", "Tadepalligudem", "Kavali", "Puttaparthi",
      "Srikalahasti", "Bapatla", "Narsapuram", "Rayachoti", "Paderu", "Parvathipuram", "Anakapalli", "Amaravati",
      "Mangalagiri", "Palakollu", "Jaggayyapeta", "Nuzvid", "Markapur", "Chirala", "Gudur", "Kadiri", "Tanuku",
      "Samalkot", "Peddapuram", "Tuni", "Srisailam", "Puttur", "Repalle", "Sullurpeta", "Yemmiganur",
    ],
  },
];

export const ALL_CITIES = STATE_CITIES.flatMap(({ state, cities }) => cities.map((name) => ({ name, state })));
