import * as THREE from "three";

type ClothingRegion = "hoodie" | "jeans";

const skinParts = [
  "face",
  "head",
  "hair",
  "eye",
  "skin",
  "hand",
  "foot",
  "shoe",
];
const hoodieParts = [
  "hood",
  "shirt",
  "sweat",
  "upper",
  "torso",
  "jacket",
  "coat",
];
const jeansParts = ["jean", "pant", "trouser", "leg", "thigh", "calf", "shin"];

function getPartName(mesh: THREE.SkinnedMesh) {
  const materialNames = Array.isArray(mesh.material)
    ? mesh.material.map((material) => material.name).join(" ")
    : mesh.material.name;
  return `${mesh.name} ${materialNames}`.toLowerCase();
}

function getNamedRegion(mesh: THREE.SkinnedMesh): ClothingRegion | null {
  const name = getPartName(mesh);
  if (skinParts.some((part) => name.includes(part))) return null;
  if (hoodieParts.some((part) => name.includes(part))) return "hoodie";
  if (jeansParts.some((part) => name.includes(part))) return "jeans";
  return null;
}

function getSpatialRegion(
  bounds: THREE.Box3,
  characterBounds: THREE.Box3
): ClothingRegion | null {
  const size = bounds.getSize(new THREE.Vector3());
  const characterSize = characterBounds.getSize(new THREE.Vector3());
  if (size.y > characterSize.y * 0.65) return null;

  const centerY = bounds.getCenter(new THREE.Vector3()).y;
  const heightFromBottom = (centerY - characterBounds.min.y) / characterSize.y;

  if (size.y < characterSize.y * 0.07 || size.x < characterSize.x * 0.08) {
    return null;
  }
  if (
    heightFromBottom >= 0.48 &&
    heightFromBottom <= 0.78 &&
    size.x >= characterSize.x * 0.12
  ) {
    return "hoodie";
  }
  if (
    heightFromBottom >= 0.12 &&
    heightFromBottom <= 0.52 &&
    size.y >= characterSize.y * 0.1
  ) {
    return "jeans";
  }
  return null;
}

function applyClothingMaterial(mesh: THREE.SkinnedMesh, region: ClothingRegion) {
  const color = region === "hoodie" ? "#17191f" : "#252b3b";
  const materials = Array.isArray(mesh.material)
    ? mesh.material
    : [mesh.material];

  const clothingMaterials = materials.map((material) => {
    const clothingMaterial = material.clone();
    if (
      clothingMaterial instanceof THREE.MeshStandardMaterial ||
      clothingMaterial instanceof THREE.MeshPhysicalMaterial
    ) {
      clothingMaterial.color.set(color);
      clothingMaterial.roughness = 0.88;
      clothingMaterial.metalness = 0;
    }
    return clothingMaterial;
  });

  mesh.material = Array.isArray(mesh.material)
    ? clothingMaterials
    : clothingMaterials[0];
}

export default function styleCharacterOutfit(character: THREE.Object3D) {
  character.updateMatrixWorld(true);
  const skinnedMeshes: THREE.SkinnedMesh[] = [];
  character.traverse((object) => {
    if (object instanceof THREE.SkinnedMesh) skinnedMeshes.push(object);
  });

  const characterBounds = new THREE.Box3();
  skinnedMeshes.forEach((mesh) => characterBounds.expandByObject(mesh));

  let styledParts = 0;
  skinnedMeshes.forEach((mesh) => {
    const name = getPartName(mesh);
    if (skinParts.some((part) => name.includes(part))) return;

    const bounds = new THREE.Box3().expandByObject(mesh);
    const region =
      getNamedRegion(mesh) ?? getSpatialRegion(bounds, characterBounds);
    if (!region) return;

    applyClothingMaterial(mesh, region);
    styledParts += 1;
  });

  if (styledParts === 0) {
    console.warn(
      "Could not identify separate clothing meshes for the hoodie and jeans color styling."
    );
  }
}
