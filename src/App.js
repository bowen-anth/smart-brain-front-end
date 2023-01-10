import React, { Component, useEffect } from 'react';
import ParticlesBg from 'particles-bg'
import FaceRecognition from './components/FaceRecognition/FaceRecognition';
import Navigation from './components/Navigation/Navigation';
import Signin from './components/Signin/Signin';
import Register from './components/Register/Register';
import Logo from './components/Logo/Logo';
import ImageLinkForm from './components/ImageLinkForm/ImageLinkForm';
import Rank from './components/Rank/Rank';
import './App.css';

const API_KEY = `${process.env.REACT_APP_KEY}`;

const initialState = {
  input: '',
  imageUrl: '',
  box: {},
  route: 'signin',
  isSignedIn: false,
  user: {
    id: '',
    name: '',
    email: '',
    entries: 0,
    joined: ''
  }
}

class App extends Component {
  constructor() {
    super();
    this.state = initialState;
  }

  loadUser = (data) => {
    this.setState({user: {
      id: data.id,
      name: data.name,
      email: data.email,
      entries: data.entries,
      joined: data.joined
    }})
  }

  calculateFaceLocation = (data) => {
    const clarifaiFace = JSON.parse(data, null, 2).outputs[0].data.regions[0]
      .region_info.bounding_box;
      console.log(clarifaiFace)
    const image = document.getElementById("inputimage");
    const width = Number(image.width);
    const height = Number(image.height);
    return {
      leftCol: clarifaiFace.left_col * width,
      topRow: clarifaiFace.top_row * height,
      rightCol: width - clarifaiFace.right_col * width,
      bottomRow: height - clarifaiFace.bottom_row * height,
    };
  };

  displayFaceBox = (box) => {
    console.log(box);
    this.setState({ box: box });
  };

  onInputChange = (event) => {
    this.setState({ input: event.target.value });
  };

  // onKeyPress = (event) => {
  //   if (event.key === "Enter") {
  //     this.onButtonSubmit();
  //   }
  // };

  onButtonSubmit = () => {
    const raw = JSON.stringify({
      user_app_id: {
        user_id: "guitarizt",
        app_id: "my-first-application",
      },
      inputs: [
        {
          data: {
            image: {
              url: this.state.input,
            },
          },
          
        },
      ],
    });

    fetch(
      "https://api.clarifai.com/v2/models/f76196b43bbd45c99b4f3cd8e8b40a8a/outputs",
      {
        method: "POST",
        headers: {
          Accept: "application/json",
          Authorization: API_KEY,
        },
        body: raw,
      }
    )
    .then((response) => response.text())
    .then((response) => {
      if (response){
        fetch('https://intense-plains-82472.herokuapp.com/image', {
          method: 'put',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify({
            id: this.state.user.id
          })
        })
        .then(response => response.json())
        .then(count => {
          this.setState(Object.assign(this.state.user, {entries: count}));
        });
      }
      this.displayFaceBox(this.calculateFaceLocation(response));
    })
    .catch((error) => console.log('error', error));
      // .then((response) => response.text())
      // .then((result) => this.displayFaceBox(this.calculateFaceLocation(result)))
      // .catch((error) => console.log("error", error));
  };




  //   useKey = (key, cb) => {
  //     const callbackRef = useRef(cb);

  //     useEffect(() => {
  //       callbackRef.current = cb;
  //     })

  //     useEffect(() => {

  //       function handle(event) {
  //         if(event.code === key) {
  //           callbackRef.current(event);
  //         }
  //       }

  //       document.addEventListener("keypress", handle)
  //       return () => document.removeEventListener("keypress", handle)
  //     }, [key]);
  //   }

  //   function handleEnter() {
  //     console.log("Enter key is pressed");
  //     const raw = JSON.stringify({
  //       user_app_id: {
  //         user_id: "guitarizt",
  //         app_id: "my-first-application",
  //       },
  //       inputs: [
  //         {
  //           data: {
  //             image: {
  //               url: this.state.input,
  //             },
  //           },
            
  //         },
  //       ],
  //     });

  //   fetch(
  //     "https://api.clarifai.com/v2/models/f76196b43bbd45c99b4f3cd8e8b40a8a/outputs",
  //     {
  //       method: "POST",
  //       headers: {
  //         Accept: "application/json",
  //         Authorization: API_KEY,
  //       },
  //       body: raw,
  //     }
  //   )
  //   .then((response) => response.text())
  //   .then((response) => {
  //     if (response){
  //       fetch('https://intense-plains-82472.herokuapp.com/image', {
  //         method: 'put',
  //         headers: {'Content-Type': 'application/json'},
  //         body: JSON.stringify({
  //           id: this.state.user.id
  //         })
  //       })
  //       .then(response => response.json())
  //       .then(count => {
  //         this.setState(Object.assign(this.state.user, {entries: count}));
  //       });
  //     }
  //     this.displayFaceBox(this.calculateFaceLocation(response));
  //   })
  //   .catch((error) => console.log('error', error));
  //     // .then((response) => response.text())
  //     // .then((result) => this.displayFaceBox(this.calculateFaceLocation(result)))
  //     // .catch((error) => console.log("error", error));
  // };
  //   }

  //   useKey("Enter", handleEnter);

  onRouteChange = (route) => {
    if (route === 'signout') {
      this.setState(initialState)
    } else if (route === 'home') {
      this.setState({isSignedIn: true})
    }
    this.setState({route: route});
  }

  render() {
    const { isSignedIn, imageUrl, route, box } = this.state;
    return (
      <div className="App">
        <ParticlesBg type="circle" bg={true} />
        <Navigation isSignedIn={isSignedIn} onRouteChange={this.onRouteChange} />
        { route === 'home'
          ? <div>
              <Logo />
              <Rank
                name={this.state.user.name}
                entries={this.state.user.entries}
              />
              <ImageLinkForm
                onInputChange={this.onInputChange}
                // onKeyPress={this.onKeyPress}
                onButtonSubmit={this.onButtonSubmit}
              />
              <FaceRecognition box={this.state.box} imageUrl={this.state.input} />
              {/* <FaceRecognition box={box} imageUrl={imageUrl} /> */}
            </div>
          : (
             route === 'signin'
             ? <Signin loadUser={this.loadUser} onRouteChange={this.onRouteChange}/>
             : <Register loadUser={this.loadUser} onRouteChange={this.onRouteChange}/>
            )
        }
      </div>
    );
  }
}
export default App;