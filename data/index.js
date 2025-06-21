const { images, icons, COLORS } = require("../constants");

export const featuredEvents = [
    {
        id: "1",
        eventImage: images.event1,
        days: 30,
        months: "Dec",
        eventTitle: "KPOP Award Indonesia",
        eventAddress: "Town Hall Islington London",
        attenderImage1: images.avatar1,
        attenderImage2: images.avatar2,
        attenderImage3: images.avatar3,
        attenderImage4: images.avatar4
    },
    {
        id: "2",
        eventImage: images.event2,
        days: 22,
        months: "Jan",
        eventTitle: "KPOP Award USA",
        eventAddress: "Town Hall Islington London",
        attenderImage1: images.avatar3,
        attenderImage2: images.avatar4,
        attenderImage3: images.avatar5,
        attenderImage4: images.avatar6
    },
    {
        id: "3",
        eventImage: images.event3,
        days: 11,
        months: "Jun",
        eventTitle: "Skateboard Fest London",
        eventAddress: "Town Hall Islington London",
        attenderImage1: images.avatar3,
        attenderImage2: images.avatar4,
        attenderImage3: images.avatar5,
        attenderImage4: images.avatar6
    },
    {
        id: "4",
        eventImage: images.event3,
        days: 12,
        months: "Aug",
        eventTitle: "Visual Projection Paris",
        eventAddress: "Town Hall Islington London",
        attenderImage1: images.avatar3,
        attenderImage2: images.avatar4,
        attenderImage3: images.avatar5,
        attenderImage4: images.avatar6
    },
   
]

export const categoryEvents = [
    {
        id: "1",
        name: "Food Event",
        image: images.food
    },
    {
        id: "2",
        name: "Gaming Event",
        image: images.games
    },
    {
        id: "3",
        name: "Movie Event",
        image: images.movie
    },
    {
        id: "4",
        name: "Music Event",
        image: images.music
    },
    {
        id: "5",
        name: "Sport Event",
        image: images.sport
    },
    {
        id: "6",
        name: "Party Event",
        image: images.party
    }
];

export const organizers = [
    {
        id: "1",
        name: "Space-X Tech",
        image: images.event1
    },
    {
        id: "2",
        name: "Skateboard Fest",
        image: images.event2
    },
    {
        id: "3",
        name: "Visual Projection",
        image: images.event3
    },
    {
        id: "4",
        name: "Hacktober Fest",
        image: images.event4
    },
    {
        id: "5",
        name: "WeDream Fest",
        image: images.event4
    },
];

export const upcomingEvents = [
    {
        id: "1",
        image: images.event3,
        title: "New Year Explore Event",
        address: "Town Hall Islington London",
        date: "Sat, Dec 2025, at 12.00 PM",
        attenderImage1: images.avatar1,
        attenderImage2: images.avatar2
    },
    {
        id: "2",
        image: images.event1,
        title: "Music Disco Event",
        address: "Town Hall Islington London",
        date: "Sat, Dec 2025, at 12.00 PM",
        attenderImage1: images.avatar1,
        attenderImage2: images.avatar2
    },
    {
        id: "3",
        image: images.event4,
        title: "Sport Award Event",
        address: "Town Hall Islington London",
        date: "Sat, Dec 2025, at 12.00 PM",
        attenderImage1: images.avatar1,
        attenderImage2: images.avatar2
    },

];

export const eventsYouJoined = [
    {
        id: "1",
        image: images.event3,
        title: "New Year Explore Event",
        address: "Town Hall Islington London",
        date: "Sat, Dec 2025, at 12.00 PM",
        attenderImage1: images.avatar1,
        attenderImage2: images.avatar2
    },
    {
        id: "2",
        image: images.event1,
        title: "Music Disco Event",
        address: "Town Hall Islington London",
        date: "Sat, Dec 2025, at 12.00 PM",
        attenderImage1: images.avatar1,
        attenderImage2: images.avatar2
    },
    {
        id: "3",
        image: images.event4,
        title: "Sport Award Event",
        address: "Town Hall Islington London",
        date: "Sat, Dec 2025, at 12.00 PM",
        attenderImage1: images.avatar1,
        attenderImage2: images.avatar2
    },

]

export const eventsGoing = [
    {
        id: "1",
        image: images.event3,
        title: "New Year Explore Event",
        address: "Town Hall Islington London",
        date: "Sat, Dec 2025, at 12.00 PM",
        attenderImage1: images.avatar1,
        attenderImage2: images.avatar2
    },
    {
        id: "2",
        image: images.event1,
        title: "Music Disco Event",
        address: "Town Hall Islington London",
        date: "Sat, Dec 2025, at 12.00 PM",
        attenderImage1: images.avatar1,
        attenderImage2: images.avatar2
    },
    {
        id: "3",
        image: images.event4,
        title: "Sport Award Event",
        address: "Town Hall Islington London",
        date: "Sat, Dec 2025, at 12.00 PM",
        attenderImage1: images.avatar1,
        attenderImage2: images.avatar2
    },

];

export const favouriteEvents = [
    {
        id: "1",
        image: images.event3,
        title: "New Year Explore Event",
        address: "Town Hall Islington London",
        date: "Sat, Dec 2025, at 12.00 PM",
        attenderImage1: images.avatar1,
        attenderImage2: images.avatar2
    },
    {
        id: "2",
        image: images.event1,
        title: "Music Disco Event",
        address: "Town Hall Islington London",
        date: "Sat, Dec 2025, at 12.00 PM",
        attenderImage1: images.avatar1,
        attenderImage2: images.avatar2
    },
    {
        id: "3",
        image: images.event4,
        title: "Sport Award Event",
        address: "Town Hall Islington London",
        date: "Sat, Dec 2025, at 12.00 PM",
        attenderImage1: images.avatar1,
        attenderImage2: images.avatar2
    },

];

export const todolist = [
    {
        id: "1",
        icon: icons.tasks,
        title: "Start Work on Project",
        description: "You will have to finish project", 
        time: "5 Hours",
        color: COLORS.purple
    },
    {
        id: "2",
        icon: icons.users,
        title: "Event Metting",
        description: "You will have Meting in Dubai", 
        time: "10 Hours",
        color: COLORS.primary
    },
    {
        id: "3",
        icon: icons.store,
        title: "Shopping In Jamuna",
        description: "You will have Meting in Dubai", 
        time: "9 Hours",
        color: COLORS.blue
    },
    {
        id: "4",
        icon: icons.passport,
        title: "Travel to Dubai",
        description: "You will have Meting in Dubai", 
        time: "12 Hours",
        color: COLORS.primary
    },
    {
        id: "5",
        icon: icons.bank,
        title: "Go to IBBL Bank",
        description: "Deposit $300 to IBBL", 
        time: "11 Hours",
        color: COLORS.purple
    }
];

export const followersSuggestions = [
    {
        id: "1",
        avatar: images.avatar1,
        name: "Music Event Expo",
        numEventOrganized: 200
    },
    {
        id: "2",
        avatar: images.avatar2,
        name: "Tech Event",
        numEventOrganized: 100
    },
    {
        id: "3",
        avatar: images.avatar3,
        name: "Movie Event Ltd",
        numEventOrganized: 1300
    },
    {
        id: "4",
        avatar: images.avatar4,
        name: "Music Event Expo",
        numEventOrganized: 100
    },
    {
        id: "5",
        avatar: images.avatar5,
        name: "Music Event Expo",
        numEventOrganized: 200
    },
    {
        id: "6",
        avatar: images.avatar6,
        name: "Tech Event",
        numEventOrganized: 100
    },
    {
        id: "7",
        avatar: images.avatar7,
        name: "Movie Event Ltd",
        numEventOrganized: 100
    },
    {
        id: "8",
        avatar: images.avatar8,
        name: "Music Event Expo",
        numEventOrganized: 100
    },
    {
        id: "9",
        avatar: images.avatar9,
        name: "Music Event Expo",
        numEventOrganized: 200
    }
];

export const newsData = [
    {
        id: "1",
        firstName: "Anuska",
        lastName: "Sharma",
        avatar: images.avatar1
    },
    {
        id: "2",
        firstName: "Anuska",
        lastName: "Sharma",
        avatar: images.avatar2
    },
    {
        id: "3",
        firstName: "Anuska",
        lastName: "Sharma",
        avatar: images.avatar3
    },
    {
        id: "4",
        firstName: "Anuska",
        lastName: "Sharma",
        avatar: images.avatar4
    },
    {
        id: "5",
        firstName: "Anuska",
        lastName: "Sharma",
        avatar: images.avatar5
    },
    {
        id: "6",
        firstName: "Anuska",
        lastName: "Sharma",
        avatar: images.avatar6
    }
];

export const onlineFriends = [
    {
        id: "1",
        firstName: "Anuska",
        lastName: "Sharma",
        avatar: images.avatar1
    },
    {
        id: "2",
        firstName: "Anuska",
        lastName: "Sharma",
        avatar: images.avatar2
    },
    {
        id: "3",
        firstName: "Anuska",
        lastName: "Sharma",
        avatar: images.avatar3
    },
    {
        id: "4",
        firstName: "Anuska",
        lastName: "Sharma",
        avatar: images.avatar4
    },
    {
        id: "5",
        firstName: "Anuska",
        lastName: "Sharma",
        avatar: images.avatar5
    },
    {
        id: "6",
        firstName: "Anuska",
        lastName: "Sharma",
        avatar: images.avatar6
    },
    {
        id: "7",
        firstName: "Anuska",
        lastName: "Sharma",
        avatar: images.avatar7
    },
    {
        id: "8",
        firstName: "Anuska",
        lastName: "Sharma",
        avatar: images.avatar8
    },
    {
        id: "9",
        firstName: "Anuska",
        lastName: "Sharma",
        avatar: images.avatar9
    }
];

export const messsagesData = [
    {
        id: "1",
        fullName: "Jhon Smith",
        isOnline: false,
        userImg: images.avatar1,
        lastSeen: "2023-11-16T04:52:06.501Z",
        lastMessage: 'I love you. see you soon baby',
        messageInQueue: 2,
        lastMessageTime: "12:25 PM",
        isOnline: true,
    },
    {
        id: "2",
        fullName: "Anuska Sharma",
        isOnline: false,
        userImg: images.avatar2,
        lastSeen: "2023-11-18T04:52:06.501Z",
        lastMessage: 'I Know. you are so busy man.',
        messageInQueue: 0,
        lastMessageTime: "12:15 PM",
        isOnline: false
    },
    {
        id: "3",
        fullName: "Virat Kohili",
        isOnline: false,
        userImg: images.avatar3,
        lastSeen: "2023-11-20T04:52:06.501Z",
        lastMessage: 'Ok, see u soon',
        messageInQueue: 0,
        lastMessageTime: "09:12 PM",
        isOnline: true
    },
    {
        id: "4",
        fullName: "Shikhor Dhaon",
        isOnline: false,
        userImg: images.avatar4,
        lastSeen: "2023-11-18T04:52:06.501Z",
        lastMessage: 'Great! Do you Love it.',
        messageInQueue: 0,
        lastMessageTime: "04:12 PM",
        isOnline: true
    },
    {
        id: "5",
        fullName: "Shakib Hasan",
        isOnline: false,
        userImg: images.avatar5,
        lastSeen: "2023-11-21T04:52:06.501Z",
        lastMessage: 'Thank you !',
        messageInQueue: 2,
        lastMessageTime: "10:30 AM",
        isOnline: true
    },
    {
        id: "6",
        fullName: "Jacksoon",
        isOnline: false,
        userImg: images.avatar6,
        lastSeen: "2023-11-20T04:52:06.501Z",
        lastMessage: 'Do you want to go out dinner',
        messageInQueue: 3,
        lastMessageTime: "10:05 PM",
        isOnline: false
    },
    {
        id: "7",
        fullName: "Tom Jerry",
        isOnline: false,
        userImg: images.avatar7,
        lastSeen: "2023-11-20T04:52:06.501Z",
        lastMessage: 'Do you want to go out dinner',
        messageInQueue: 2,
        lastMessageTime: "11:05 PM",
        isOnline: true
    },
    {
        id: "8",
        fullName: "Lucky Luck",
        isOnline: false,
        userImg: images.avatar8,
        lastSeen: "2023-11-20T04:52:06.501Z",
        lastMessage: 'Can you share the design with me?',
        messageInQueue: 2,
        lastMessageTime: "09:11 PM",
        isOnline: true
    },
    {
        id: "9",
        fullName: "Nate Jack",
        isOnline: false,
        userImg: images.avatar9,
        lastSeen: "2023-11-20T04:52:06.501Z",
        lastMessage: 'Tell me what you want?',
        messageInQueue: 0,
        lastMessageTime: "06:43 PM",
        isOnline: true
    }
]

export const photosData = [
    {
        id: "1",
        image: images.event1,
        comments: 12,
        shares: 22,
        likes: 120
    },
    {
        id: "2",
        image: images.event2,
        comments: 78,
        shares: 220,
        likes: 90
    },
    {
        id: "3",
        image: images.event3,
        comments: 112,
        shares: 228,
        likes: 80
    },
    {
        id: "4",
        image: images.event4,
        comments: 980,
        shares: 56,
        likes: 11
    },
    {
        id: "5",
        image: images.avatar5,
        comments: 930,
        shares: 56,
        likes: 11
    },
];

export const comments = [
    {
        id: "1",
        name: "Naymer Jr",
        comments: "Wow...it’s awesome! Can’t wait to see more live streaming from you", 
        time: "15:05 PM"
    },
    {
        id: "2",
        name: "Leo Messi",
        comments: "Great! Love it.", 
        time: "12:21 PM"
    }
];

export const userCards = [
    {
        id: "1",
        number: "2298 1268 3398 9874",
        balance: "28885.00",
        date: "12/24"
    },
    {
        id: "2",
        number: "4222 1268 3398 9874",
        balance: "12985.00",
        date: "09/26"
    },
    {
        id: "3",
        number: "4242 4242 3398 9874",
        balance: "120003.00",
        date: "12/25"
    },
    {
        id: "4",
        number: "4141 4242 3398 9874",
        balance: "100000.00",
        date: "12/25"
    },
    {
        id: "4",
        number: "4242 4242 3398 9874",
        balance: "1230015.25",
        date: "11/25"
    },
];

export const eventReviews = [
    {
        id: 1,
        eventId: 101,
        reviewerImage: images.avatar7,
        reviewerName: 'John Doe',
        title: 'Exceptional Concert Experience',
        description: 'Attended a live concert at this venue, and it was an absolutely amazing experience! The performers were outstanding, and the atmosphere was electric. A perfect night out!',
        date: '2023-06-15T00:00:00.000Z',
        rating: 5
    },
    {
        id: 2,
        eventId: 102,
        reviewerImage: images.avatar2,
        reviewerName: 'Jane Smith',
        title: 'Beautiful Wedding Venue',
        description: 'The wedding venue was breathtaking, and the staff ensured everything ran smoothly. The only minor issue was that the floral arrangements were not as expected.',
        date: '2023-08-10T00:00:00.000Z',
        rating: 4
    },
    {
        id: 3,
        eventId: 103,
        reviewerImage: images.avatar3,
        reviewerName: 'Alice Johnson',
        title: 'Charming Conference Space',
        description: 'Attended a business conference at this venue, and it had a charming, luxurious feel. The facilities were well-equipped, and the organizers did an excellent job.',
        date: '2023-09-05T00:00:00.000Z',
        rating: 5
    },
    {
        id: 4,
        eventId: 104,
        reviewerImage: images.avatar4,
        reviewerName: 'Bob Anderson',
        title: 'Perfect Retreat for Retreat',
        description: 'The location for our team retreat was ideal, offering both privacy and easy access to team-building activities. The event space exceeded our expectations.',
        date: '2023-09-20T00:00:00.000Z',
        rating: 5
    },
    {
        id: 5,
        eventId: 105,
        reviewerImage: images.avatar5,
        reviewerName: 'Eva Martinez',
        title: 'Tranquil Art Exhibition',
        description: 'The art exhibition\'s tranquil setting provided a wonderful escape from the hustle and bustle of everyday life. A great collection of diverse artworks!',
        date: '2023-10-03T00:00:00.000Z',
        rating: 5
    }
];
