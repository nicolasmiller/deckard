if ( ! Detector.webgl ) Detector.addGetWebGLMessage();

var container, stats;
var camera, scene, renderer;
var projector, plane, cube;
var mouse2D, mouse3D, raycaster,
rollOveredFace, isShiftDown = false,
theta = 45 * 0.5, isCtrlDown = false;

var rollOverMesh, rollOverMaterial;
var voxelPosition = new THREE.Vector3(), tmpVec = new THREE.Vector3(), normalMatrix = new THREE.Matrix3();
var cubeGeo, cubeMaterial;
var i, intersector;
var width = 1000; // window.innerWidth
var height = 1000; // window.innerHeight
var position_plane;
var size = 500;
var step = 50;

init();
animate();

function init() {
		container = document.createElement( 'div' );
		document.body.appendChild( container );

		var info = document.createElement( 'div' );
		info.style.position = 'absolute';
		info.style.top = '100px';
		info.style.width = '100%';
		info.style.textAlign = 'center';
		container.appendChild( info );

		camera = new THREE.PerspectiveCamera( 45, width / height, 1, 10000 );
		camera.position.y = 800;

		scene = new THREE.Scene();

		// roll-over helpers

		rollOverGeo = new THREE.CubeGeometry( 50, 50, 50 );
		rollOverMaterial = new THREE.MeshBasicMaterial( { color: 0xff0000, opacity: 0.5, transparent: true } );
		rollOverMesh = new THREE.Mesh( rollOverGeo, rollOverMaterial );
		scene.add( rollOverMesh );

		// cubes

		cubeGeo = new THREE.CubeGeometry( 50, 50, 50 );
		cubeMaterial = new THREE.MeshLambertMaterial( { color: 0xfeb74c, ambient: 0x00ff80, shading: THREE.FlatShading, map: THREE.ImageUtils.loadTexture( "textures/square-outline-textured.png" ) } );
		cubeMaterial.ambient = cubeMaterial.color;

		// picking

		projector = new THREE.Projector();

		// grid

		var geometry = new THREE.Geometry();

		for ( var i = - size; i <= size; i += step ) {

				geometry.vertices.push( new THREE.Vector3( - size, 0, i ) );
				geometry.vertices.push( new THREE.Vector3(   size, 0, i ) );

				geometry.vertices.push( new THREE.Vector3( i, 0, - size ) );
				geometry.vertices.push( new THREE.Vector3( i, 0,   size ) );

		}

		var material = new THREE.LineBasicMaterial( { color: 0x000000, opacity: 0.2, transparent: true } );

		var line = new THREE.Line( geometry, material );
		line.type = THREE.LinePieces;
		scene.add( line );

		plane = new THREE.Mesh( new THREE.PlaneGeometry( 1000, 1000 ), new THREE.MeshBasicMaterial() );
		plane.rotation.x = - Math.PI / 2;
		plane.visible = false;
		scene.add( plane );

		mouse2D = new THREE.Vector3( 0, 10000, 0.5 );

    position_plane = new THREE.Mesh(new THREE.PlaneGeometry(1000, 1000), new THREE.MeshBasicMaterial());
    position_plane.overdraw = true;
    position_plane.position.z -= 10 * 50;
    scene.add(position_plane);

		// Lights

		var ambientLight = new THREE.AmbientLight( 0x606060 );
		scene.add( ambientLight );

		var directionalLight = new THREE.DirectionalLight( 0xffffff );
		directionalLight.position.set( 1, 0.75, 0.5 ).normalize();
		scene.add( directionalLight );

		renderer = new THREE.WebGLRenderer( { antialias: true } );
		renderer.setClearColor( 0xf0f0f0 );
		renderer.setSize(width, height);

		container.appendChild( renderer.domElement );

		stats = new Stats();
		stats.domElement.style.position = 'absolute';
		stats.domElement.style.top = '0px';
		container.appendChild( stats.domElement );

		document.addEventListener( 'mousemove', onDocumentMouseMove, false );
		document.addEventListener( 'mousedown', onDocumentMouseDown, false );
		document.addEventListener( 'keydown', onDocumentKeyDown, false );
		document.addEventListener( 'keyup', onDocumentKeyUp, false );

		window.addEventListener( 'resize', onWindowResize, false );
}

function onWindowResize() {
		camera.aspect = width / height;
		camera.updateProjectionMatrix();
		renderer.setSize(width, height);
}

function getRealIntersector( intersects ) {
		for( i = 0; i < intersects.length; i++ ) {
				intersector = intersects[ i ];
				if ( intersector.object != rollOverMesh ) {
						return intersector;
				}
		}
		return null;
}

function setVoxelPosition( intersector ) {
		normalMatrix.getNormalMatrix( intersector.object.matrixWorld );

		tmpVec.copy( intersector.face.normal );
		tmpVec.applyMatrix3( normalMatrix ).normalize();

		voxelPosition.addVectors( intersector.point, tmpVec );

		voxelPosition.x = Math.floor( voxelPosition.x / 50 ) * 50 + 25;
		voxelPosition.y = Math.floor( voxelPosition.y / 50 ) * 50 + 25;
		voxelPosition.z = Math.floor( voxelPosition.z / 50 ) * 50 + 25;
}

function onDocumentMouseMove( event ) {
		event.preventDefault();
		mouse2D.x = (event.clientX / width) * 2 - 1;
		mouse2D.y = -(event.clientY / height) * 2 + 1;
}

function onDocumentMouseDown( event ) {
		event.preventDefault();

		var intersects = raycaster.intersectObjects( scene.children );
		if (intersects.length > 0) {
				intersector = getRealIntersector( intersects );

				// delete cube

				if ( isCtrlDown ) {
						if ( intersector.object != plane ) {
							  scene.remove( intersector.object );
						}
					  // create cube

				} else {
						intersector = getRealIntersector( intersects );
						setVoxelPosition( intersector );

						var voxel = new THREE.Mesh( cubeGeo, cubeMaterial );
						voxel.position.copy( voxelPosition );
						voxel.matrixAutoUpdate = false;
						voxel.updateMatrix();
						scene.add( voxel );
				}
		}
}

function onDocumentKeyDown( event ) {
		switch( event.keyCode ) {
		case 16: 
        isShiftDown = true; 
        break;
		case 17: 
        isCtrlDown = true; 
        break;
		}
}

function onDocumentKeyUp( event ) {
		switch ( event.keyCode ) {
        
		case 16: 
        isShiftDown = false;
        break;
		case 17: 
        isCtrlDown = false;
        break;
		}
}

var frame = 0;
var current_step = 0;

function animate() {
    console.log(frame)
    if((frame % 15) == 0) {
        position_plane.position.z += 50;
        current_step += 1;
        if((current_step % 21) == 0) {
            position_plane.position.z -= 21 * 50;
            current_step = 0;
        }
    }
    frame += 1;
		requestAnimationFrame( animate );

		render();
		stats.update();
}

function render() {
		if (isShiftDown) {
				theta += mouse2D.x * 1.5;
		}

		raycaster = projector.pickingRay( mouse2D.clone(), camera );

		var intersects = raycaster.intersectObjects( scene.children );

		if (intersects.length > 0) {
				intersector = getRealIntersector( intersects );
				if (intersector) {
						setVoxelPosition( intersector );
						rollOverMesh.position = voxelPosition;
				}
		}

		camera.position.x = 1400 * Math.sin( THREE.Math.degToRad( theta ) );
		camera.position.z = 1400 * Math.cos( THREE.Math.degToRad( theta ) );
		camera.lookAt( scene.position );
		renderer.render( scene, camera );
}
