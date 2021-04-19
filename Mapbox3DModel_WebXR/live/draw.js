// Function from mapbox required to draw a 3d model on a custom layer
// most comments in this doc are mine added to help me understand whats going on


function drawmodel(modelname, modelOriginIN){

  // parameters to ensure the model is georeferenced correctly on the map
    var modelOrigin = [170.507269, -45.887285];
    var modelAltitude = 0;
    var modelRotate = [Math.PI / 2, 0, 0];

    var modelAsMercatorCoordinate = mapboxgl.MercatorCoordinate.fromLngLat(
        modelOrigin,
        modelAltitude
    );

    // transformation parameters to position, rotate and scale the 3D model onto the map
    var modelTransform = {
        translateX: modelAsMercatorCoordinate.x,
        translateY: modelAsMercatorCoordinate.y,
        translateZ: modelAsMercatorCoordinate.z,
        rotateX: modelRotate[0],
        rotateY: modelRotate[1],
        rotateZ: modelRotate[2],
        /* Since our 3D model is in real world meters, a scale transform needs to be
         * applied since the CustomLayerInterface expects units in MercatorCoordinates.
         */
        scale: modelAsMercatorCoordinate.meterInMercatorCoordinateUnits() //Returns the distance of 1 meter in MercatorCoordinate units at this latitude.
    };

    var THREE = window.THREE;

    // using the customelayerinterface stuff, contians onAdd, render,
    // configuration of the custom layer for a 3D model per the CustomLayerInterface
    var customLayer = {
        id: '3d-model', // all must be included
        type: 'custom',
        renderingMode: '3d',
        onAdd: function(mapEl, gl) { // the map to add this customer layer too and
            const WIDTH = getWidth();
            const HEIGHT = getHeight();

            this.scene = new THREE.Scene();
            this.camera = new THREE.PerspectiveCamera(90, (WIDTH/HEIGHT), 0.1, 10000);

            // use the Mapbox GL JS map canvas for three.js
            this.renderer = new THREE.WebGLRenderer({
                canvas: mapEl.getCanvas(),
                context: gl,
                antialias: true
            });

            this.renderer.autoClear = false;

            this.camera.position.set(0, 1.6, 0);
            this.scene.add(camera);

            this.renderer.setSize(WIDTH, HEIGHT);

            this.renderer.xr.enabled = true;
            document.body.appendChild(VRButton.createButton(this.renderer));

            // create two three.js lights to illuminate the model
            var directionalLight = new THREE.DirectionalLight(0xffffff);
            directionalLight.position.set(0, -70, 100).normalize();
            this.scene.add(directionalLight);

            var directionalLight2 = new THREE.DirectionalLight(0xffffff);
            directionalLight2.position.set(0, 70, 100).normalize();
            this.scene.add(directionalLight2);

            // use the three.js GLTF loader to add the 3D model to the three.js scene
            var loader = new THREE.GLTFLoader();
            loader.load(
                "../img/HarbourMolars.gltf",
                function(gltf) {
                    this.scene.add(gltf.scene);
                }.bind(this)
            );

        },
        render: function(gl, matrix) {

            var rotationX = new THREE.Matrix4().makeRotationAxis(
                new THREE.Vector3(1, 0, 0),
                modelTransform.rotateX
            );
            var rotationY = new THREE.Matrix4().makeRotationAxis(
                new THREE.Vector3(0, 1, 0),
                modelTransform.rotateY
            );
            var rotationZ = new THREE.Matrix4().makeRotationAxis(
                new THREE.Vector3(0, 0, 1),
                modelTransform.rotateZ
            );

            var m = new THREE.Matrix4().fromArray(matrix);
            var l = new THREE.Matrix4()
                .makeTranslation(
                    modelTransform.translateX,
                    modelTransform.translateY,
                    modelTransform.translateZ
                )
                .scale(
                    new THREE.Vector3(
                        modelTransform.scale,
                        -modelTransform.scale,
                        modelTransform.scale
                    )
                )
                .multiply(rotationX)
                .multiply(rotationY)
                .multiply(rotationZ);

            this.camera.updateProjectionMatrix();
            this.renderer.state.reset();
            this.renderer.render(this.scene, this.camera);
            map.triggerRepaint();
        }
 };

   map.on('style.load', function() {
         map.addLayer(customLayer); // had remove the 'watermark' so that it worked with stalite maps
    });
}
