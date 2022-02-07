 let vueApp = new Vue({
    el: "#vueApp",
    data: {

        // ros connection
        ros: null,
        rosbridge_address: 'ws://192.168.1.93:9090',
        connected: false,

        // slider valule
        slider: {
            value: 0,
        },
        // publisher
        pubInterval: null,

        // 3D
        logs: [],
        loading: false,
        viewer:null,
        tfClient: null,
        urdfClient: null,

        // Axes 

        My_Axes: [
            {Name: "Axis n°1", Value: 0},
            {Name: "Axis n°2", Value: 0},
            {Name: "Axis n°3", Value: 0},
            {Name: "Axis n°4", Value: 0},
            {Name: "Axis n°5", Value: 0},
            {Name: "Axis n°6", Value: 0},
        ],

        My_Motors_Parameters: [
            {Name: "Axis n°1", Position: 0, Speed: 0, Acceleration: 0, Deceleration: 0, Feedback: 0},
            {Name: "Axis n°2", Position: 0, Speed: 0, Acceleration: 0, Deceleration: 0, Feedback: 0},
            {Name: "Axis n°3", Position: 0, Speed: 0, Acceleration: 0, Deceleration: 0, Feedback: 0},
            {Name: "Axis n°4", Position: 0, Speed: 0, Acceleration: 0, Deceleration: 0, Feedback: 0},
            {Name: "Axis n°5", Position: 0, Speed: 0, Acceleration: 0, Deceleration: 0, Feedback: 0},
            {Name: "Axis n°6", Position: 0, Speed: 0, Acceleration: 0, Deceleration: 0, Feedback: 0},
        ]

    },
    methods: {
        connect: function () {
            this.loading = true
            // define ROSBridge connection object
            this.ros = new ROSLIB.Ros({
                url: this.rosbridge_address
            })

            // define callbacks
            this.ros.on('connection', () => {
                this.logs.unshift((new Date()).toTimeString() + ' - Connected!')
                this.connected = true
                this.loading = false
                this.setup3DViewer()
                this.pubInterval = setInterval(this.sendJointStates, 25) // Intervalle de publication
                console.log('Connection to ROSBridge established!')
            })
            this.ros.on('error', (error) => {
                this.logs.unshift((new Date()).toTimeString() + ` - Error: ${error}`)
                console.log('Something went wrong when trying to connect')
                console.log(error)
            })
            this.ros.on('close', () => {
                this.logs.unshift((new Date()).toTimeString() + ' - Disconnected!')
                this.connected = false
                this.loading = false
                this.unset3DViewer()
                clearInterval(this.pubInterval)
                console.log('Connection to ROSBridge was closed!')
            })
        },
        disconnect: function () {
            this.ros.close()
        },
        // sendCommand: function () {
        //     let topic = new ROSLIB.Topic({
        //         ros: this.ros,
        //         name: '/cmd_vel',
        //         messageType: 'geometry_msgs/Twist'
        //     })
        //     let message = new ROSLIB.Message({
        //         linear: { x: 1, y: 0, z: 0, },
        //         angular: { x: 0, y: 0, z: 0.5, },
        //     })
        //     topic.publish(message)
        // },

        // sendJointStates: function () {
        //     let topic = new ROSLIB.Topic({
        //         ros: this.ros,
        //         name: '/joint_states',
        //         messageType: 'sensor_msgs/JointState',
        //     })
        //     let message = new ROSLIB.Message({
        //         name: ["joint_Base_Axe1","joint_Axe1_Axe2","joint_Axe2_Axe3","joint_Axe3_Axe4","joint_Axe4_Axe5","joint_Axe5_Axe6"],
        //         position: [parseFloat(this.test),0,0,0,0,0],
        //         header: {stamp: ros.get_rostime(),},
        //     })
        //     topic.publish(message)
        // },
        
        setup3DViewer() {
            this.viewer = new ROS3D.Viewer({
                background: 000,
                divID: 'div3DViewer',
                width: 400,
                height: 300,
                antialias: true
            })

            // Add a grid
            this.viewer.addObject(new ROS3D.Grid({
                color:'#0181c4',
                cellSize: 0.5,
                num_cells: 20
            }))

            // Setup a client to listen to TFs
            this.tfClient = new ROSLIB.TFClient({
                ros: this.ros,
                fixedFrame: 'Base',
                angularThres: 0.01,
                transThres: 0.01,
                rate: 10.0
            })

            // Setup the URDF client
            this.urdfClient = new ROS3D.UrdfClient({
                ros: this.ros,
                tfClient: this.tfClient,
                param: 'my_robot_description',
                // path: window.location.href,
                path: 'http://192.168.1.93:7000/src/my_robot_description/models/little_fat/meshes/',
                rootObject: this.viewer.scene,
                loader: ROS3D.COLLADA_LOADER_2
            })

        },

        unset3DViewer(){
            document.getElementById('div3DViewer').innerHTML = ''
        },
    },

    mounted() {
        // page is ready
        console.log('page is ready!')
    },
})