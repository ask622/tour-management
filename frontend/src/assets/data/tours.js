import tourImg01 from "../images/tour-img01.jpg";
import tourImg02 from "../images/tour-img02.jpg";
import tourImg03 from "../images/tour-img03.jpg";
import tourImg04 from "../images/tour-img04.jpg";
import tourImg05 from "../images/tour-img05.jpg";
import tourImg06 from "../images/tour-img06.jpg";
import tourImg07 from "../images/tour-img07.jpg";
import tourImg08 from "../images/tour-img08.jpg"; // New image
import tourImg09 from "../images/tour-img09.jpg"; // New image

const tours = [
  {
    id: "01",
    title: "Nainital Lake Tour",
    city: "Nainital",
    distance: 300,
    address: 'Nainital, Uttarakhand',
    price: 7000,
    maxGroupSize: 10,
    desc: "Explore the beautiful Nainital Lake and enjoy boating, the picturesque views, and the serene environment.",
    ratings: [
      {
        name: "Harsh Baman",
        rating: 4.6,
      },
      {
        name: "Jaiveer Singh",
        rating: 5,
      },
    ],
   averageRating: 4.8,
    image: tourImg01,
    featured: true,
  },
  {
    id: "02",
    title: "Mussoorie Tour",
    city: "Mussoorie",
    distance: 400,
    address: 'Mussoorie, Uttarakhand',
    price: 7500,
    maxGroupSize: 8,
    desc: "A serene hill station with mesmerizing views of the Himalayan range, perfect for nature lovers.",
    ratings: [
      {
        name: "Jaiveer Singh",
        rating: 4.6,
      },
    ],
   averageRating: 4.7,
    image: tourImg02,
    featured: true,
  },
  {
    id: "03",
    title: "Rishikesh Adventure Tour",
    city: "Rishikesh",
    distance: 500,
    address: 'Rishikesh, Uttarakhand',
    price: 8000,
    maxGroupSize: 8,
    desc: "Rishikesh is the perfect destination for adventure lovers with activities like rafting, trekking, and yoga retreats.",
    ratings: [
      {
        name: "Jaiveer Singh",
        rating: 4.9,
      },
    ],
   averageRating: 4.8,
    image: tourImg03,
    featured: true,
  },
  {
    id: "04",
    title: "Auli Skiing Tour",
    city: "Auli",
    distance: 600,
    address: 'Auli, Uttarakhand',
    price: 10000,
    maxGroupSize: 6,
    desc: "Auli is a perfect place for skiing, with beautiful slopes and breathtaking views of the Himalayan range.",
    ratings: [
      {
        name: "Rahul Sharma",
        rating: 5,
      },
    ],
   averageRating: 5,
    image: tourImg04,
    featured: true,
  },
  {
    id: "05",
    title: "Valley of Flowers Trek",
    city: "Chamoli",
    distance: 700,
    address: 'Chamoli, Uttarakhand',
    price: 12000,
    maxGroupSize: 6,
    desc: "A UNESCO World Heritage site, the Valley of Flowers is a trek through stunning meadows filled with exotic flowers.",
    ratings: [],
   averageRating: 4.5,
    image: tourImg05,
    featured: false,
  },
  {
    id: "06",
    title: "Har Ki Doon Trek",
    city: "Sankri",
    distance: 800,
    address: 'Sankri, Uttarakhand',
    price: 11000,
    maxGroupSize: 8,
    desc: "One of the most scenic treks in Uttarakhand, offering views of snow-capped peaks and traditional villages.",
    ratings: [],
   averageRating: 4.6,
    image: tourImg06,
    featured: false,
  },
  {
    id: "07",
    title: "Kedarnath Yatra",
    city: "Kedarnath",
    distance: 900,
    address: 'Kedarnath, Uttarakhand',
    price: 15000,
    maxGroupSize: 10,
    desc: "A sacred pilgrimage to the Kedarnath Temple amidst the stunning snow-clad mountains of the Himalayas.",
    ratings: [],
   averageRating: 4.7,
    image: tourImg07,
    featured: false,
  },
  {
    id: "08",
    title: "Badrinath Yatra",
    city: "Badrinath",
    distance: 900,
    address: 'Badrinath, Uttarakhand',
    price: 16000,
    maxGroupSize: 10,
    desc: "Visit the famous Badrinath Temple in Uttarakhand and explore its spiritual significance and the beautiful surroundings.",
    ratings: [],
   averageRating: 4.6,
    image: tourImg03,
    featured: false,
  },
  {
    id: "09",
    title: "Chopta Tungnath Trek",
    city: "Chopta",
    distance: 450,
    address: "Chopta, Uttarakhand",
    price: 9000,
    maxGroupSize: 8,
    desc: "Explore the serene beauty of Chopta and trek to Tungnath, the highest Shiva temple in the world.",
    ratings: [
      {
        name: "Ankit Rawat",
        rating: 4.8,
      },
    ],
    averageRating: 4.8,
    image: tourImg08,
    featured: true,
  },
  {
    id: "10",
    title: "Jim Corbett Safari",
    city: "Jim Corbett",
    distance: 250,
    address: "Jim Corbett National Park, Uttarakhand",
    price: 6000,
    maxGroupSize: 12,
    desc: "Experience the thrill of a wildlife safari in Jim Corbett National Park, home to the majestic Bengal tiger.",
    ratings: [
      {
        name: "Rohit Sharma",
        rating: 4.7,
      },
      {
        name: "Priya Singh",
        rating: 4.5,
      },
    ],
    averageRating: 4.6,
    image: tourImg09,
    featured: false,
  },
];

export default tours;
