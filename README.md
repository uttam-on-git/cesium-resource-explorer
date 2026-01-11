# Cesium Resource Explorer

hey so this is the cesium viewer app i built for the assignment. its basically a 3D globe thing where you can see satellite imagery and terrain and stuff. pretty cool actually once you get it running

## how to run this thing

ok so first you need node.js installed. i think i used v18 or something but v20 probably works too idk

1. clone the repo (you probably already did this lol)

2. install the dependencies:
```bash
npm install
```
this takes a while btw, cesium is like really big

3. you need a cesium ion token!! go to https://ion.cesium.com and make an account (its free). then grab your access token and make a `.env` file in the root folder:
```
VITE_CESIUM_TOKEN=your_token_here_dont_share_this
```

4. run the dev server:
```bash
npm run dev
```

5. open http://localhost:5173 in your browser (it should say this in the terminal anyway)

## features

- **3D globe viewer** - you can spin it around and zoom and stuff
- **layer management** - theres a panel on the right where you can toggle different layers on/off like imagery, terrain, 3d buildings etc
- **location search** - search box on the left to find layers quickly
- **my location button** - bottom left corner, click it to fly to where you are (you gotta allow location permissions tho). it also does this automatically when the app loads

## tech stack

- react (with vite cuz its faster than create-react-app)
- cesiumjs for the 3d globe stuff
- tailwind css v4 for styling

## other commands

```bash
npm run build    # makes a production build in dist/
npm run lint     # runs eslint to check for errors
npm run preview  # preview the production build locally
```

## known issues

- the geolocation thing might not work if youre on http instead of https (browser security stuff). localhost should be fine tho
- some layers are pretty big so they take a sec to load, just wait for it

## folder structure

```
src/
  components/   # react components (viewer, layer manager, etc)
  services/     # cesium service functions
  hooks/        # custom react hooks
  constants/    # asset configs and stuff
```

thats pretty much it! lmk if something doesnt work
