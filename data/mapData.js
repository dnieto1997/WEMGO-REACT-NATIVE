import { images } from "../constants";

export const markers = [
    {
      id: "1",
      coordinate: {
        latitude: 22.6293867,
        longitude: 88.4354486,
      },
      name: "Event By Explore IT",
       description: "Town Hall Islington London",
        type: "Music",
        image: images.event1,
        rating: 4.5,
        reviews: 120,
        address: "Town Hall Islington London",
        phoneNumber: "+1 (555) 123-4567",
        time: "15 min",
        distance: 1.5,
        ticketPrice: 100
    },
    {
      id: "2",
      coordinate: {
        latitude: 22.6345648,
        longitude: 88.4377279,
      },
      name: "Music Disco Event",
      description: "Town Hall Islington Paris",
      type: "Music",
      image: images.event2,
      rating: 4.8,
      reviews: 90,
      address: "Town Hall Islington Paris",
      phoneNumber: "+1 (555) 987-6543",
      time: "35 min",
      distance: 3,
      ticketPrice: 1100

    },
    {
      id: "3",
      coordinate: {
        latitude: 22.6281662,
        longitude: 88.4410113,
      },
      name: "New Year Explore Event 2",
        description: "Town Hall Islington Paris",
        type: "Sport",
        image: images.event3,
        rating: 4.2,
        reviews: 150,
        address: "789 Oak Lane, Suburb",
        phoneNumber: "+1 (555) 321-7890",
        time: "40 min",
        distance: 2.5,
        ticketPrice: 100
    },
    {
      id: "4",
      coordinate: {
        latitude: 22.6341137,
        longitude: 88.4497463,
      },
      name: "Luna Medical Event",
      description: "Town Hall Islington London",
      type: "Medical",
      image: images.event4,
      rating: 4.9,
      reviews: 120,
      address: "Town Hall Islington London",
      phoneNumber: "+1 (555) 321-7890",
      time: "10 min",
      distance: 2,
      ticketPrice: 10000
    }
];

export const mapDarkStyle = [
    {
      "elementType": "geometry",
      "stylers": [
        {
          "color": "#212121"
        }
      ]
    },
    {
      "elementType": "labels.icon",
      "stylers": [
        {
          "visibility": "off"
        }
      ]
    },
    {
      "elementType": "labels.text.fill",
      "stylers": [
        {
          "color": "#757575"
        }
      ]
    },
    {
      "elementType": "labels.text.stroke",
      "stylers": [
        {
          "color": "#212121"
        }
      ]
    },
    {
      "featureType": "administrative",
      "elementType": "geometry",
      "stylers": [
        {
          "color": "#757575"
        }
      ]
    },
    {
      "featureType": "administrative.country",
      "elementType": "labels.text.fill",
      "stylers": [
        {
          "color": "#9e9e9e"
        }
      ]
    },
    {
      "featureType": "administrative.land_parcel",
      "stylers": [
        {
          "visibility": "off"
        }
      ]
    },
    {
      "featureType": "administrative.locality",
      "elementType": "labels.text.fill",
      "stylers": [
        {
          "color": "#bdbdbd"
        }
      ]
    },
    {
      "featureType": "poi",
      "elementType": "labels.text.fill",
      "stylers": [
        {
          "color": "#757575"
        }
      ]
    },
    {
      "featureType": "poi.park",
      "elementType": "geometry",
      "stylers": [
        {
          "color": "#181818"
        }
      ]
    },
    {
      "featureType": "poi.park",
      "elementType": "labels.text.fill",
      "stylers": [
        {
          "color": "#616161"
        }
      ]
    },
    {
      "featureType": "poi.park",
      "elementType": "labels.text.stroke",
      "stylers": [
        {
          "color": "#1b1b1b"
        }
      ]
    },
    {
      "featureType": "road",
      "elementType": "geometry.fill",
      "stylers": [
        {
          "color": "#2c2c2c"
        }
      ]
    },
    {
      "featureType": "road",
      "elementType": "labels.text.fill",
      "stylers": [
        {
          "color": "#8a8a8a"
        }
      ]
    },
    {
      "featureType": "road.arterial",
      "elementType": "geometry",
      "stylers": [
        {
          "color": "#373737"
        }
      ]
    },
    {
      "featureType": "road.highway",
      "elementType": "geometry",
      "stylers": [
        {
          "color": "#3c3c3c"
        }
      ]
    },
    {
      "featureType": "road.highway.controlled_access",
      "elementType": "geometry",
      "stylers": [
        {
          "color": "#4e4e4e"
        }
      ]
    },
    {
      "featureType": "road.local",
      "elementType": "labels.text.fill",
      "stylers": [
        {
          "color": "#616161"
        }
      ]
    },
    {
      "featureType": "transit",
      "elementType": "labels.text.fill",
      "stylers": [
        {
          "color": "#757575"
        }
      ]
    },
    {
      "featureType": "water",
      "elementType": "geometry",
      "stylers": [
        {
          "color": "#000000"
        }
      ]
    },
    {
      "featureType": "water",
      "elementType": "labels.text.fill",
      "stylers": [
        {
          "color": "#3d3d3d"
        }
      ]
    }
  ];

  export const mapStandardStyle = [
    {
      "elementType": "labels.icon",
      "stylers": [
        {
          "visibility": "off"
        }
      ]
    },
  ];