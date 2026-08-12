// Three.js Scene Setup
let scene, camera, renderer, controls;
let dnaGroup;
let genesGroup; // Group for gene highlights
let headerSprite;
let raycaster = new THREE.Raycaster();
let mouse = new THREE.Vector2();
let hoveredGene = null;
let allGeneMeshes = []; // Keep track for raycasting

// DNA Configuration
const DNA_CONFIG = {
  radius: 3,
  verticalSpacing: 0.8,
  twistAmount: Math.PI / 6, // 30 degrees per base pair
  sphereRadius: 0.4,
  backboneRadius: 0.15,
  bondRadius: 0.08,
};

// Color mapping for nucleotides
const NUCLEOTIDE_COLORS = {
  A: 0x5050ff, // Azure
  T: 0xe6e600, // Yellow
  G: 0x00ff00, // Green
  C: 0xe00000, // Carmine
};

const BACKBONE_COLOR = 0x808080; // Neutral gray

// Complementary base pairing
const COMPLEMENT = {
  A: "T",
  T: "A",
  G: "C",
  C: "G",
};

// Initialize the scene
function init() {
  // Scene
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x000000);

  // Camera
  camera = new THREE.PerspectiveCamera(
    60,
    window.innerWidth / window.innerHeight,
    0.1,
    1000,
  );
  camera.position.set(15, 10, 15);
  camera.lookAt(0, 0, 0);

  // Renderer
  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(window.devicePixelRatio);
  document.getElementById("canvas-container").appendChild(renderer.domElement);

  // Orbit Controls
  controls = new THREE.OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.05;
  controls.minDistance = 5;
  controls.maxDistance = 5000; // Increased to allow viewing long sequences

  // Lighting
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
  scene.add(ambientLight);

  const directionalLight1 = new THREE.DirectionalLight(0xffffff, 0.8);
  directionalLight1.position.set(10, 10, 10);
  scene.add(directionalLight1);

  const directionalLight2 = new THREE.DirectionalLight(0xffffff, 0.4);
  directionalLight2.position.set(-10, -10, -10);
  scene.add(directionalLight2);

  // Groups
  dnaGroup = new THREE.Group();
  scene.add(dnaGroup);

  genesGroup = new THREE.Group();
  scene.add(genesGroup);

  // Add camera to scene
  scene.add(camera);

  // Event Listeners
  window.addEventListener("resize", onWindowResize);
  window.addEventListener("mousemove", onMouseMove);
  document
    .getElementById("generate-btn")
    .addEventListener("click", generateDNA);
  document.getElementById("sequence-input").addEventListener("keypress", e => {
    if (e.key === "Enter") {
      generateDNA();
    }
  });

  // document.getElementById("read-btn").addEventListener("click", e => {
  //   userInputAccession(document.getElementById("accession-input").value.trim());
  // });
  // document.getElementById("accession-input").addEventListener("keypress", e => {
  //   if (e.key === "Enter") {
  //     userInputAccession(e.target.value.trim());
  //   }
  // });

  // Clear the 3D header if accession field is emptied
  // document.getElementById("accession-input").addEventListener("input", e => {
  //   if (!e.target.value.trim()) {
  //     updateFastaHeader(null);
  //     document.getElementById("error-message").textContent = ""; // Clear error on reset
  //   }
  // });

  // Input validation - only allow A, T, G, C
  document.getElementById("sequence-input").addEventListener("input", e => {
    const input = e.target;
    const filtered = input.value.toUpperCase().replace(/[^ATGC]/g, "");
    input.value = filtered;
  });

  // Generate initial DNA with sample sequence
  document.getElementById("sequence-input").value = "ATGCATGC";
  generateDNA();

  // Start animation loop
  animate();
}

function onMouseMove(event) {
  // Calculate mouse position in normalized device coordinates
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
}

// Create or update the 3D FASTA header sprite
function updateFastaHeader(text) {
  if (headerSprite) {
    camera.remove(headerSprite);
    headerSprite.material.map.dispose();
    headerSprite.material.dispose();
    headerSprite = null;
  }

  if (!text) return;

  const resolutionScale = 4; // High-res scaling
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  const fontSize = 40 * resolutionScale;
  const lineHeight = fontSize * 1.2;
  const maxWidth = 800 * resolutionScale;
  ctx.font = `bold ${fontSize}px Inter, Arial`;

  // Function to wrap text
  const words = text.split(" ");
  const lines = [];
  let currentLine = words[0];

  for (let i = 1; i < words.length; i++) {
    const word = words[i];
    const width = ctx.measureText(currentLine + " " + word).width;
    if (width < maxWidth) {
      currentLine += " " + word;
    } else {
      lines.push(currentLine);
      currentLine = word;
    }
  }
  lines.push(currentLine);

  // Calculate dynamic canvas size
  const maxLineWidth = Math.min(
    maxWidth,
    Math.max(...lines.map(line => ctx.measureText(line).width)),
  );
  canvas.width = maxLineWidth + 100 * resolutionScale;
  canvas.height = lines.length * lineHeight + 40 * resolutionScale;

  // Set font again after resize
  ctx.font = `bold ${fontSize}px Inter, Arial`;

  // Glassmorphism-style background
  ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
  ctx.beginPath();
  ctx.roundRect(0, 0, canvas.width, canvas.height, 20 * resolutionScale);
  ctx.fill();
  ctx.strokeStyle = "rgba(255, 255, 255, 0.2)";
  ctx.lineWidth = 2 * resolutionScale;
  ctx.stroke();

  // Text rendering
  ctx.shadowColor = "rgba(0, 0, 0, 0.5)";
  ctx.shadowBlur = 10 * resolutionScale;
  ctx.fillStyle = "#ffffff";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  lines.forEach((line, index) => {
    const y =
      canvas.height / 2 -
      ((lines.length - 1) * lineHeight) / 2 +
      index * lineHeight;
    ctx.fillText(line, canvas.width / 2, y);
  });

  const texture = new THREE.CanvasTexture(canvas);
  texture.minFilter = THREE.LinearMipmapLinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.generateMipmaps = true;

  const maxAnisotropy = renderer.capabilities.getMaxAnisotropy();
  texture.anisotropy = maxAnisotropy;

  const spriteMaterial = new THREE.SpriteMaterial({
    map: texture,
    transparent: true,
    depthTest: false,
  });

  headerSprite = new THREE.Sprite(spriteMaterial);
  updateHeaderPosition();
  camera.add(headerSprite);
}

// Position the header sprite at the top center of the camera view
function updateHeaderPosition() {
  if (!headerSprite) return;

  // Calculate position based on FOV and aspect ratio
  const distance = 10; // Distance from camera
  const fov = camera.fov * (Math.PI / 180);
  const viewHeight = 2 * Math.tan(fov / 2) * distance;
  const viewWidth = viewHeight * camera.aspect;

  // Place it at the top, slightly offset from the edge
  headerSprite.position.set(0, viewHeight / 2 - 0.8, -distance);

  // Scale according to canvas aspect ratio and fit within viewWidth
  const canvas = headerSprite.material.map.image;

  // Maximum width the header is allowed to take (90% of screen)
  const maxAllowedWidth = viewWidth * 0.9;
  const baseScale = 0.015;

  // Calculate scale to fit if necessary
  let currentScale = baseScale;
  if (canvas.width * currentScale > maxAllowedWidth) {
    currentScale = maxAllowedWidth / canvas.width;
  }

  headerSprite.scale.set(
    canvas.width * currentScale,
    canvas.height * currentScale,
    1,
  );
}

// Validate Accession Number format (basic check)
function isValidAccession(accession) {
  // as defined by NLM: https://support.nlm.nih.gov/kbArticle/?pn=KA-03436
  //[alphabetical prefix] [series of digits] [.] [version number]
  const accessionRegex = /^[A-Z]+[_]\d+(\.\d+)?$/i;
  return accessionRegex.test(accession);
}

// Event handler for fetching DNA by Accession Number
function userInputAccession(userInputAccessionValue) {
  if (isValidAccession(userInputAccessionValue)) {
    fetchDNAByAccession(userInputAccessionValue);
  } else {
    document.getElementById("error-message").textContent =
      "Invalid Accession Number format.";
  }
}

// Fetch DNA sequence from NCBI by Accession Number
async function fetchDNAByAccession(accession) {
  const errorMsg = document.getElementById("error-message");
  if (!accession) {
    errorMsg.textContent = "Please enter an Accession Number";
    return;
  }

  errorMsg.textContent = "";

  const readBtn = document.getElementById("read-btn");
  readBtn.textContent = "Reading...";
  readBtn.disabled = true;

  const accessionPrefix = accession.split("_")[0]; // e.g., 'NC' from 'NC_000001.11'

  try {
    // Check cache first
    const cacheKey = `dna_cache_${accession}`;
    const cachedData = localStorage.getItem(cacheKey);

    let headerText,
      sequence,
      genes = [];

    if (cachedData) {
      console.log(`Cache hit for ${accession}`);
      const data = JSON.parse(cachedData);
      headerText = data.header;
      sequence = data.sequence;
      genes = data.genes || [];
    } else {
      // Use a CORS proxy to bypass browser security restrictions
      const proxyUrl = "https://corsproxy.io/?";
      // Use the sviewer endpoint with report=genbank
      const targetUrl = `https://www.ncbi.nlm.nih.gov/sviewer/viewer.fcgi?db=nuccore&report=genbank&id=${accession}`;

      const response = await fetch(proxyUrl + encodeURIComponent(targetUrl));

      if (!response.ok) {
        throw new Error(`NCBI returned status ${response.status}`);
      }

      const text = await response.text();

      // --- GenBank Parser ---

      // Extract Definition (Header)
      const definitionMatch = text.match(
        /DEFINITION\s+([\s\S]+?)(?=\n[A-Z]|$)/,
      );
      headerText = definitionMatch
        ? definitionMatch[1].replace(/\s+/g, " ").trim()
        : accession;

      // Extract Genes from FEATURES
      const geneRegex = /^\s+gene\s+(\d+)\.\.(\d+)/gm;
      let match;
      while ((match = geneRegex.exec(text)) !== null) {
        genes.push({
          start: parseInt(match[1]),
          end: parseInt(match[2]),
        });
      }

      // Extract Sequence from ORIGIN
      const originIndex = text.indexOf("ORIGIN");
      if (originIndex === -1) {
        throw new Error("Could not find ORIGIN section in GenBank record");
      }

      const originText = text.substring(originIndex);
      sequence = originText.replace(/[^atcg]/gi, "").toUpperCase();

      if (sequence.length === 0) {
        throw new Error("No valid DNA sequence found in this Accession");
      }

      // Save to cache
      try {
        localStorage.setItem(
          cacheKey,
          JSON.stringify({
            header: headerText,
            sequence,
            genes,
          }),
        );
      } catch (e) {
        console.warn("LocalStorage limit reached, could not cache results");
      }
    }

    const sequenceInput = document.getElementById("sequence-input");
    sequenceInput.value = ""; // Clear manual input for clarity

    generateDNA(sequence, genes);

    // Update the 3D header AFTER generation
    updateFastaHeader(headerText);
  } catch (error) {
    console.error("Fetch error:", error);
    errorMsg.textContent = `Error: ${error.message}. (Note: NCBI may block direct requests due to CORS)`;
  } finally {
    readBtn.textContent = "Read";
    readBtn.disabled = false;
  }
}

// Create cylinder for backbone or bonds
function createCylinder(start, end, radius, color) {
  const direction = new THREE.Vector3().subVectors(end, start);
  const length = direction.length();
  const geometry = new THREE.CylinderGeometry(radius, radius, length, 8);
  const material = new THREE.MeshPhongMaterial({
    color: color,
    shininess: 80,
  });
  const cylinder = new THREE.Mesh(geometry, material);

  // Position and orient the cylinder
  cylinder.position.copy(start).add(direction.multiplyScalar(0.5));
  cylinder.quaternion.setFromUnitVectors(
    new THREE.Vector3(0, 1, 0),
    direction.clone().normalize(),
  );

  return cylinder;
}

// Calculate position on the helix (horizontal orientation)
function getHelixPosition(index, radius, offset = 0) {
  const angle = index * DNA_CONFIG.twistAmount + offset;
  const x = index * DNA_CONFIG.verticalSpacing; // DNA extends along X-axis
  const y = radius * Math.cos(angle); // Helix spiral on Y-axis
  const z = radius * Math.sin(angle); // Helix spiral on Z-axis
  return new THREE.Vector3(x, y, z);
}

// Generate DNA structure from sequence
function generateDNA() {
  // future params for this function if I can get Accession number to work with NCBI API
  // inputOverride, genes = []
  // const input = (inputOverride || document.getElementById("sequence-input"))
  const input = document
    .getElementById("sequence-input")
    .value.toUpperCase()
    .trim();
  const errorMsg = document.getElementById("error-message");

  // Validation
  if (!input) {
    errorMsg.textContent = "Please enter a DNA sequence";
    return;
  }

  if (!/^[ATGC]+$/.test(input)) {
    errorMsg.textContent = "Invalid sequence. Only A, T, G, C allowed.";
    return;
  }

  errorMsg.textContent = "";
  updateFastaHeader(null); // Clear 3D header

  // Clear existing DNA and genes
  while (dnaGroup.children.length > 0) {
    dnaGroup.remove(dnaGroup.children[0]);
  }
  while (genesGroup.children.length > 0) {
    genesGroup.remove(genesGroup.children[0]);
  }
  allGeneMeshes = [];

  const sequence = input.split("");
  const complementSequence = sequence.map(base => COMPLEMENT[base]);

  // Create DNA strands
  for (let i = 0; i < sequence.length; i++) {
    const base1 = sequence[i];
    const base2 = complementSequence[i];

    // Positions for both strands (backbone positions)
    const backbonePos1 = getHelixPosition(i, DNA_CONFIG.radius, 0);
    const backbonePos2 = getHelixPosition(i, DNA_CONFIG.radius, Math.PI);

    // Create backbone connections (continuous cylinders)
    if (i > 0) {
      const prevBackbonePos1 = getHelixPosition(i - 1, DNA_CONFIG.radius, 0);
      const prevBackbonePos2 = getHelixPosition(
        i - 1,
        DNA_CONFIG.radius,
        Math.PI,
      );

      const backbone1 = createCylinder(
        prevBackbonePos1,
        backbonePos1,
        DNA_CONFIG.backboneRadius,
        BACKBONE_COLOR,
      );
      const backbone2 = createCylinder(
        prevBackbonePos2,
        backbonePos2,
        DNA_CONFIG.backboneRadius,
        BACKBONE_COLOR,
      );
      dnaGroup.add(backbone1);
      dnaGroup.add(backbone2);
    }

    // Calculate midpoint for the base pair
    const midpoint = new THREE.Vector3()
      .addVectors(backbonePos1, backbonePos2)
      .multiplyScalar(0.5);

    // Create nucleotide bars (from backbone to midpoint)
    const bar1 = createCylinder(
      backbonePos1,
      midpoint,
      DNA_CONFIG.bondRadius * 2,
      NUCLEOTIDE_COLORS[base1],
    );
    const bar2 = createCylinder(
      backbonePos2,
      midpoint,
      DNA_CONFIG.bondRadius * 2,
      NUCLEOTIDE_COLORS[base2],
    );
    dnaGroup.add(bar1);
    dnaGroup.add(bar2);
  }

  // Render Genes
  // genes.forEach((gene, index) => {
  //   // Gene coordinates are usually 1-indexed in GenBank, indices are 0-indexed
  //   const startIdx = Math.max(0, gene.start - 1);
  //   const endIdx = Math.min(sequence.length - 1, gene.end - 1);

  //   if (startIdx >= sequence.length) return;

  //   // Create a sheath/cylinder for the gene
  //   const startPos = getHelixPosition(startIdx, 0, 0); // Along the central axis
  //   const endPos = getHelixPosition(endIdx, 0, 0);

  //   const direction = new THREE.Vector3().subVectors(endPos, startPos);
  //   const length = direction.length();

  //   // We make it slightly thicker than the bonds to encompass the structure
  //   const geometry = new THREE.CylinderGeometry(
  //     DNA_CONFIG.radius * 1.1,
  //     DNA_CONFIG.radius * 1.1,
  //     length,
  //     16,
  //   );
  //   const material = new THREE.MeshPhongMaterial({
  //     color: 0x00ffff, // Cyan for genes
  //     transparent: true,
  //     opacity: 0.3,
  //     shininess: 100,
  //     side: THREE.DoubleSide,
  //   });

  //   const geneMesh = new THREE.Mesh(geometry, material);
  //   geneMesh.position.copy(startPos).add(direction.clone().multiplyScalar(0.5));
  //   geneMesh.quaternion.setFromUnitVectors(
  //     new THREE.Vector3(0, 1, 0),
  //     direction.clone().normalize(),
  //   );

  //   geneMesh.userData = { geneIndex: index, start: gene.start, end: gene.end };
  //   genesGroup.add(geneMesh);
  //   allGeneMeshes.push(geneMesh);
  // });

  // Center the DNA structure (horizontal orientation)
  const centerX = ((sequence.length - 1) * DNA_CONFIG.verticalSpacing) / 2;
  dnaGroup.position.x = -centerX;
  genesGroup.position.x = -centerX;

  // Adjust camera to view the DNA (horizontal orientation)
  const dnaLength = sequence.length * DNA_CONFIG.verticalSpacing;
  const optimalDistance = Math.max(15, dnaLength * 1.2);
  camera.position.set(0, optimalDistance * 0.6, optimalDistance);
  camera.lookAt(0, 0, 0);
  controls.target.set(0, 0, 0);
}

// Handle window resize
function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);

  // Re-position header for new aspect ratio
  updateHeaderPosition();
}

// Animation loop
function animate() {
  requestAnimationFrame(animate);
  controls.update();

  // Raycasting for gene hover
  if (allGeneMeshes.length > 0) {
    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(allGeneMeshes);

    if (intersects.length > 0) {
      const intersected = intersects[0].object;
      if (hoveredGene !== intersected) {
        // Restore previous hovered gene
        if (hoveredGene) {
          hoveredGene.material.opacity = 0.3;
          hoveredGene.material.emissive.setHex(0x000000);
        }
        // Set new hovered gene
        hoveredGene = intersected;
        hoveredGene.material.opacity = 0.8;
        hoveredGene.material.emissive.setHex(0x003333); // Subtle glow

        // You could also show a tooltip here
        console.log(
          `Hovering gene: ${hoveredGene.userData.start}..${hoveredGene.userData.end}`,
        );
      }
    } else {
      // Restore previous if nothing is hovered
      if (hoveredGene) {
        hoveredGene.material.opacity = 0.3;
        hoveredGene.material.emissive.setHex(0x000000);
        hoveredGene = null;
      }
    }
  }

  // Gentle rotation of DNA around its length axis
  if (dnaGroup) {
    dnaGroup.rotation.x += 0.002;
    genesGroup.rotation.clone(dnaGroup.rotation); // Sync genes rotation
    genesGroup.rotation.x = dnaGroup.rotation.x;
  }

  renderer.render(scene, camera);
}

// Initialize when page loads
window.addEventListener("load", init);
