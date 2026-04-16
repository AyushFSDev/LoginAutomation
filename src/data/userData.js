// src/data/userData.js
// 5 test users — each covers a different flow case

export const USERS = {
  // UseCase 1 — 1 Institute + 1 Role → direct Dashboard
  "jameswilson@scos.com": {
    password: "1234",
    user: {
      name: "James Wilson",
      initials: "JW",
      institutes: [
        {
          id: 1,
          name: "North Park Academy",
          location: "Mumbai, Maharashtra",
          type: "School",
          roles: [
            { id: "admin", name: "Administrator", desc: "Full system access" },
          ],
        },
      ],
    },
  },

  // UseCase 2 — Multi Institute + 1 Role → Institute Select → Dashboard
  "sarah.parker@scos.com": {
    password: "1234",
    user: {
      name: "Sarah Parker",
      initials: "SP",
      institutes: [
        {
          id: 1,
          name: "North Park Academy",
          location: "Mumbai, Maharashtra",
          type: "School",
          logo: "https://cdn.dribbble.com/userupload/14681708/file/original-4a454e14c0e9c38b76e07ac9b43df0c8.png",
          roles: [
            { id: "admin", name: "Administrator", desc: "Full system access" },
          ],
        },
        {
          id: 2,
          name: "Earlytech College",
          location: "Pune, Maharashtra",
          type: "College",
          logo: "https://cdn.dribbble.com/userupload/14681708/file/original-4a454e14c0e9c38b76e07ac9b43df0c8.png",
          roles: [
            { id: "admin", name: "Administrator", desc: "Full system access" },
          ],
        },
      ],
    },
  },

  // UseCase 3 — Multi Institute + Multi Role → Institute Select → Role Select → Dashboard
  "michael.ross@scos.com": {
    password: "1234",
    user: {
      name: "Michael Ross",
      initials: "MR",
      institutes: [
        {
          id: 1,
          name: "North Park Academy",
          location: "Mumbai, Maharashtra",
          type: "School",
          logo: "https://cdn.dribbble.com/userupload/14681708/file/original-4a454e14c0e9c38b76e07ac9b43df0c8.png",
          roles: [
            { id: "admin", name: "Administrator", desc: "Full system access" },
            { id: "teacher", name: "Teacher", desc: "Class & grading" },
            { id: "parent", name: "Parent", desc: "Child progress" },
          ],
        },
        {
          id: 2,
          name: "Earlytech College",
          location: "Pune, Maharashtra",
          type: "College",
          logo: "https://i.pinimg.com/236x/c2/e6/c8/c2e6c877f9bdae422d03d0d9efc8ee5e.jpg",
          roles: [
            { id: "teacher", name: "Teacher", desc: "Class & grading" },
            { id: "principal", name: "Principal", desc: "Institute oversight" },
          ],
        },
        {
          id: 3,
          name: "Renaissance Academy",
          location: "Bangalore, Karnataka",
          type: "Training",
          logo: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcStd-iqG4MhOcYyd7VWR3hOH_7ePQn6fJhRWQ&s",
          roles: [
            { id: "admin", name: "Administrator", desc: "Full system access" },
            { id: "teacher", name: "Teacher", desc: "Class & grading" },
          ],
        },

        {
          id: 4,
          name: "Sunrise Public School",
          location: "Nagpur, Maharashtra",
          type: "School",
          logo: "https://img.freepik.com/free-vector/education-logo-template_1195-20.jpg",
          roles: [
            { id: "admin", name: "Administrator", desc: "Full system access" },
            { id: "teacher", name: "Teacher", desc: "Teaching & grading" },
          ],
        },
        {
          id: 5,
          name: "Global Tech Institute",
          location: "Hyderabad, Telangana",
          type: "Training",
          logo: "https://img.freepik.com/free-vector/abstract-education-logo-template_23-2148708290.jpg",
          roles: [
            { id: "admin", name: "Administrator", desc: "Manage institute" },
            { id: "trainer", name: "Trainer", desc: "Conduct sessions" },
          ],
        },
        {
          id: 6,
          name: "Elite Commerce College",
          location: "Delhi, India",
          type: "College",
          logo: "https://img.freepik.com/free-vector/university-logo-template_1195-35.jpg",
          roles: [
            { id: "principal", name: "Principal", desc: "Full control" },
            { id: "teacher", name: "Teacher", desc: "Manage classes" },
          ],
        },
        {
          id: 7,
          name: "Bright Future Academy",
          location: "Chennai, Tamil Nadu",
          type: "School",
          logo: "https://img.freepik.com/free-vector/school-logo-template_1195-130.jpg",
          roles: [
            { id: "admin", name: "Administrator", desc: "System access" },
            { id: "teacher", name: "Teacher", desc: "Teaching" },
            { id: "parent", name: "Parent", desc: "Monitor progress" },
          ],
        },
      ],
    },
  },

  // UseCase 4 — 1 Institute + Multi Role → Role Select → Dashboard
  "emily.davis@scos.com": {
    password: "1234",
    user: {
      name: "Emily Davis",
      initials: "ED",
      institutes: [
        {
          id: 1,
          name: "North Park Academy",
          location: "Mumbai, Maharashtra",
          type: "School",
          logo: "https://i.pinimg.com/236x/c2/e6/c8/c2e6c877f9bdae422d03d0d9efc8ee5e.jpg",
          roles: [
            { id: "admin", name: "Administrator", desc: "Full system access" },
            { id: "principal", name: "Principal", desc: "Institute oversight" },
            { id: "teacher", name: "Teacher", desc: "Class & grading" },
            { id: "parent", name: "Parent", desc: "Child progress" },
          ],
        },
      ],
    },
  },

  //UseCase 5 — No Institute Associated
  "noah.brown@scos.com": {
    password: "1234",
    user: {
      name: "Liam Hudson",
      initials: "LH",
      institutes: [], // Empty array for 'No Institute' case
    },
  },
};

// UseCase 5 — Invalid credentials (wrong password / unknown email)
// Just try any wrong email or wrong password
