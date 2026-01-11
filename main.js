// --- 1. SETUP SCENE ---
const scene = new THREE.Scene();
// Darker fog for deep space feel
scene.fog = new THREE.FogExp2(0x000000, 0.002);

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({
    canvas: document.querySelector('#bg'),
    antialias: true,
    alpha: true
});

renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);
camera.position.setZ(30);

// --- 2. HERO OBJECTS (Torus) ---
const torusGeometry = new THREE.TorusGeometry(10, 3, 16, 100);
const torusMaterial = new THREE.MeshStandardMaterial({ 
    color: 0x9F361F, 
    wireframe: true,
    emissive: 0x501005,
});
const torus = new THREE.Mesh(torusGeometry, torusMaterial);
scene.add(torus);

// Starfield
const particlesGeometry = new THREE.BufferGeometry();
const particlesCount = 6000;
const posArray = new Float32Array(particlesCount * 3);
for(let i = 0; i < particlesCount * 3; i++) {
    posArray[i] = (Math.random() - 0.5) * 150; // Wider spread
}
particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
const particlesMaterial = new THREE.PointsMaterial({
    size: 0.03,
    color: 0xffffff,
    transparent: true,
    opacity: 0.6
});
const particlesMesh = new THREE.Points(particlesGeometry, particlesMaterial);
scene.add(particlesMesh);

// --- 3. THE "CYBER RING" SKILL SYSTEM ---

const textureLoader = new THREE.TextureLoader();
const skillTextures = [
    'images/html.png', 'images/css-3.png', 'images/js.png', 'images/react js.png',
    'images/node-js.webp', 'images/bootstrap.png', 'images/github-2.png', 'images/mysql.png',
    'images/express js.png', 'images/git.png', 'images/firebase.png', 'images/mongo db.png', 'images/c-.png'
];

const ringGroup = new THREE.Group();
scene.add(ringGroup);
const allTechCubes = [];

// [RESET SIZE]: Wapas 3.5 kar diya taaki baki sections me chote dikhe
const isMobile = window.innerWidth < 768;
const cubeBaseSize = isMobile ? 2.5 : 3.5; 

skillTextures.forEach((texturePath, i) => {
    const map = textureLoader.load(texturePath);
    const geometry = new THREE.BoxGeometry(cubeBaseSize, cubeBaseSize, cubeBaseSize);
    const material = new THREE.MeshStandardMaterial({ 
        map: map, roughness: 0.1, metalness: 0.8,
    });
    const cube = new THREE.Mesh(geometry, material);

    const cageSize = cubeBaseSize + 0.5; // Gap wapas normal
    const cageGeo = new THREE.BoxGeometry(cageSize, cageSize, cageSize);
    const cageMat = new THREE.MeshBasicMaterial({
        color: 0x9F361F, wireframe: true, transparent: true, opacity: 0.3
    });
    const cage = new THREE.Mesh(cageGeo, cageMat);
    
    const techBlock = new THREE.Group();
    techBlock.add(cube);
    techBlock.add(cage);

    // Initial Random Position (Hero Section me yehi dikhega)
    techBlock.position.set(
        (Math.random() - 0.5) * 100,
        (Math.random() - 0.5) * 100,
        (Math.random() - 0.5) * 100
    );
    
    techBlock.rotation.set(Math.random()*Math.PI, Math.random()*Math.PI, 0);
    techBlock.userData = { id: i };

    ringGroup.add(techBlock);
    allTechCubes.push(techBlock);
});

// --- 4. LIGHTING ---
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambientLight);

// Center light that makes the ring glow from inside
const centerLight = new THREE.PointLight(0x9F361F, 2, 50);
centerLight.position.set(0, 0, 10);
scene.add(centerLight);

// Mouse spotlight
const mouseLight = new THREE.SpotLight(0xffffff, 3);
mouseLight.position.set(0, 0, 40);
mouseLight.distance = 200;
scene.add(mouseLight);
scene.add(mouseLight.target);

// --- 5. GSAP & ANIMATION LOGIC ---
gsap.registerPlugin(ScrollTrigger);

// Horizontal Projects Wrapper
const projectsWrapper = document.querySelector(".projects-wrapper");
if(projectsWrapper) {
    gsap.to(projectsWrapper, {
        x: () => -(projectsWrapper.scrollWidth - window.innerWidth),
        ease: "none",
        scrollTrigger: {
            trigger: ".projects-horizontal",
            pin: true,
            scrub: 1,
            start: "center center", 
            end: () => "+=" + projectsWrapper.scrollWidth,
            invalidateOnRefresh: true
        }
    });
}

// --- THE RING FORMATION MATH ---

// Global Flag to track section state (Ye Loop use karega)
let skillsActive = false; 

// Trigger to toggle the flag (Ye batayega kab bada hona hai)
ScrollTrigger.create({
    trigger: "#skills",
    start: "top 60%", // Thoda jaldi bada ho jayega
    end: "bottom 40%", 
    onEnter: () => { skillsActive = true; },
    onLeave: () => { skillsActive = false; },
    onEnterBack: () => { skillsActive = true; },
    onLeaveBack: () => { skillsActive = false; }
});

const finalRadius = isMobile ? 12 : 45; 
const totalSkills = allTechCubes.length;

allTechCubes.forEach((block, i) => {
    const angle = (i / totalSkills) * Math.PI * 2;
    const xTarget = Math.cos(angle) * finalRadius;
    const yTarget = Math.sin(angle) * finalRadius;

    // 1. POSITION (Movement)
    gsap.to(block.position, {
        x: xTarget,
        y: yTarget,
        z: isMobile ? 14 : 0, 
        scrollTrigger: {
            trigger: "#skills",
            start: "top bottom",
            end: "center center",
            scrub: 1.5,
        }
    });

    // 2. ROTATION
    gsap.to(block.rotation, {
        x: 0,
        y: 0,
        z: angle,
        scrollTrigger: {
            trigger: "#skills",
            start: "top bottom",
            end: "center center",
            scrub: 1.5
        }
    });
    
    // Note: Scale animation yahan se hata diya hai, ab wo Section 8 handle karega
});


// --- 6. SCROLL MOVEMENT ---
function moveCamera() {
    const t = document.body.getBoundingClientRect().top;
    
    // Torus
    torus.rotation.x += 0.05;
    torus.rotation.y += 0.075;

    camera.position.z = t * -0.01 + 30;
}
document.body.onscroll = moveCamera;

// --- 7. INTERACTION (Raycaster) ---
const raycaster = new THREE.Raycaster();
const mouseVector = new THREE.Vector2();
let mouseX = 0, mouseY = 0;

document.addEventListener('mousemove', (e) => {
    mouseX = (e.clientX / window.innerWidth) - 0.5;
    mouseY = (e.clientY / window.innerHeight) - 0.5;
    mouseVector.x = (e.clientX / window.innerWidth) * 2 - 1;
    mouseVector.y = -(e.clientY / window.innerHeight) * 2 + 1;
    
    mouseLight.target.position.set(mouseVector.x * 40, mouseVector.y * 40, 0);
    mouseLight.target.updateMatrixWorld();
});

// --- 8. ANIMATION LOOP ---
function animate() {
    requestAnimationFrame(animate);

    // Continuous Rotation
    ringGroup.rotation.z += 0.005; 
    torus.rotation.x += 0.005;
    particlesMesh.rotation.y += 0.001;

    // --- RAYCASTER & SCALE LOGIC ---
    raycaster.setFromCamera(mouseVector, camera);
    const intersects = raycaster.intersectObjects(ringGroup.children, true);
    
    // 1. CUBES SCALING LOGIC
    let targetBaseScale = 1;
    if (skillsActive) {
        targetBaseScale = isMobile ? 1.5 : 3.5; 
    }

    // 2. [NEW] TORUS (CENTRAL RING) SCALING LOGIC
    // Jab skills section active ho, to beech wali ring ko bhi bada (2.5x) kar do
    let targetTorusScale = 1;
    if (skillsActive) {
        targetTorusScale = isMobile ? 1.5 : 2.5; 
    }
    // Smoothly scale the Torus
    torus.scale.lerp(new THREE.Vector3(targetTorusScale, targetTorusScale, targetTorusScale), 0.05);


    let hoveredBlock = null;

    if (intersects.length > 0) {
        // Find parent group
        let object = intersects[0].object;
        while(object.parent !== ringGroup) {
            object = object.parent;
        }
        hoveredBlock = object;

        // Hover Effect
        ringGroup.rotation.z -= 0.005; // Pause rotation
        
        // Active Spin
        object.rotation.x += 0.1;
        object.rotation.y += 0.1;
        
        // Glow
        object.children[1].material.opacity = 0.8; 
    } 

    // Apply Scales to ALL blocks
    allTechCubes.forEach(block => {
        let finalScale = targetBaseScale;

        // Agar ye block abhi hover ho raha hai, to ise aur bada karo (Multiplier)
        if (block === hoveredBlock) {
            finalScale *= 1.5; // Base size ka 1.5 guna
        } else {
            // Reset opacity for non-hovered blocks
            block.children[1].material.opacity = 0.3;
        }

        // Smoothly Interpolate Scale
        block.scale.lerp(new THREE.Vector3(finalScale, finalScale, finalScale), 0.1);
    });

    renderer.render(scene, camera);
}
animate();

// --- 9. RESIZE ---
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    ScrollTrigger.refresh();
});


const cursorDot = document.querySelector('[data-cursor-dot]');
const cursorOutline = document.querySelector('[data-cursor-outline]');

// Mouse Movement Logic
window.addEventListener('mousemove', function(e) {
    const posX = e.clientX;
    const posY = e.clientY;

    // Dot - Instant Movement
    cursorDot.style.left = `${posX}px`;
    cursorDot.style.top = `${posY}px`;

    // Outline - Smooth Lag Effect (Animation)
    cursorOutline.animate({
        left: `${posX}px`,
        top: `${posY}px`
    }, { duration: 500, fill: "forwards" });
});

// Hover Effect Logic (Links & Buttons)
const interactiveElements = document.querySelectorAll('a, button, .project-card, input');

interactiveElements.forEach(el => {
    el.addEventListener('mouseenter', () => {
        document.body.classList.add('hovering');
    });
    el.addEventListener('mouseleave', () => {
        document.body.classList.remove('hovering');
    });
});

// --- LOADER LOGIC ---
// --- LOADER LOGIC ---
window.addEventListener("load", function() {
    // 3.5 seconds wait karega taaki user pura naam padh sake
    setTimeout(() => {
        document.body.classList.add("loaded"); 
    }, 3500); 
});

// --- MOBILE MENU LOGIC ---
const menuToggle = document.querySelector('#mobile-menu');
const menuLinks = document.querySelector('.menu-links');
const navLinks = document.querySelectorAll('.nav-link');

// 1. Toggle Menu Open/Close
menuToggle.addEventListener('click', function() {
    menuToggle.classList.toggle('is-active'); // Icon animation ke liye
    menuLinks.classList.toggle('active'); // Menu slide ke liye
});

// 2. Close Menu when clicking a link
// (Taaki user link pe click kare to menu band ho jaye)
navLinks.forEach(link => {
    link.addEventListener('click', () => {
        menuToggle.classList.remove('is-active');
        menuLinks.classList.remove('active');
    });
});