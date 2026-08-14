import os
import re

file_path = "c:\\PROJECT\\FIND\\frontend\\src\\components\\ProductDetailClient.tsx"
with open(file_path, "r") as f:
    content = f.read()

# Replace states and derivation logic
old_logic = """  const [selectedColor, setSelectedColor] = useState<string>(colors[0] ?? "");
  const [selectedStorage, setSelectedStorage] = useState<number | null | undefined>(
    storageOptions.length > 0 ? [...storageOptions].sort((a,b)=>a-b)[0] : undefined
  );
  const [selectedImageIdx, setSelectedImageIdx] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [addedToCart, setAddedToCart] = useState(false);

  // Derive current exact variant or fallback
  const currentVariant = useMemo(() => {
    return variants.find((v) => v.color === selectedColor && (v.storage_gb ?? undefined) === selectedStorage);
  }, [variants, selectedColor, selectedStorage]);"""

new_logic = """  const processorOptions = useMemo(() => [...new Set(variants.map((v) => v.processor).filter(Boolean))] as string[], [variants]);
  
  const [selectedColor, setSelectedColor] = useState<string>(colors[0] ?? "");
  const [selectedProcessor, setSelectedProcessor] = useState<string | null | undefined>(
    processorOptions.length > 0 ? processorOptions[0] : undefined
  );
  
  const availableRams = useMemo(() => {
    const valid = variants.filter(v => v.processor === selectedProcessor || !selectedProcessor);
    return [...new Set(valid.map(v => v.ram_gb).filter(Boolean))].sort((a,b)=>a-b) as number[];
  }, [variants, selectedProcessor]);

  const [selectedRam, setSelectedRam] = useState<number | null | undefined>(
    availableRams.length > 0 ? availableRams[0] : undefined
  );

  const availableStorages = useMemo(() => {
    const valid = variants.filter(v => (v.processor === selectedProcessor || !selectedProcessor) && (v.ram_gb === selectedRam || !selectedRam));
    return [...new Set(valid.map(v => v.storage_gb).filter(Boolean))].sort((a,b)=>a-b) as number[];
  }, [variants, selectedProcessor, selectedRam]);

  const [selectedStorage, setSelectedStorage] = useState<number | null | undefined>(
    storageOptions.length > 0 ? [...storageOptions].sort((a,b)=>a-b)[0] : undefined
  );

  // Auto update ram and storage when processor changes
  useMemo(() => {
    if (availableRams.length > 0 && selectedRam !== undefined && !availableRams.includes(selectedRam)) {
      setSelectedRam(availableRams[0]);
    }
  }, [availableRams, selectedRam]);

  useMemo(() => {
    if (availableStorages.length > 0 && selectedStorage !== undefined && !availableStorages.includes(selectedStorage)) {
      setSelectedStorage(availableStorages[0]);
    }
  }, [availableStorages, selectedStorage]);


  const [selectedImageIdx, setSelectedImageIdx] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [addedToCart, setAddedToCart] = useState(false);

  // Derive current exact variant or fallback
  const currentVariant = useMemo(() => {
    return variants.find((v) => 
      v.color === selectedColor && 
      (v.storage_gb ?? undefined) === selectedStorage &&
      (v.processor ?? undefined) === selectedProcessor &&
      (v.ram_gb ?? undefined) === selectedRam
    );
  }, [variants, selectedColor, selectedStorage, selectedProcessor, selectedRam]);"""

content = content.replace(old_logic, new_logic)

# Replace handleColorChange auto-select storage logic
old_color_change = """    // Auto-select storage if current storage is not available in new color
    const hasCurrentStorage = variants.some(v => v.color === color && v.storage_gb === selectedStorage);
    if (!hasCurrentStorage) {
      const availableStorage = variants.find(v => v.color === color)?.storage_gb;
      if (availableStorage !== undefined) setSelectedStorage(availableStorage);
    }"""
new_color_change = """    // Auto-select storage if current storage is not available in new color
    const hasCurrentStorage = variants.some(v => v.color === color && v.storage_gb === selectedStorage && v.processor === selectedProcessor && v.ram_gb === selectedRam);
    if (!hasCurrentStorage) {
      const availableStorage = variants.find(v => v.color === color && v.processor === selectedProcessor && v.ram_gb === selectedRam)?.storage_gb;
      if (availableStorage !== undefined) setSelectedStorage(availableStorage);
    }"""
content = content.replace(old_color_change, new_color_change)


# Update baseVariant logic
old_base = """  // Base variant for price diff logic
  const baseStorage = storageOptions.length > 0 ? [...storageOptions].sort((a,b)=>a-b)[0] : undefined;
  const baseVariant = variants.find(v => v.color === selectedColor && v.storage_gb === baseStorage) ?? fallbackVariant;
  const basePrice = parseFloat(baseVariant.price);"""
new_base = """  // Base variant for price diff logic (find cheapest variant for this color and processor and ram)
  const baseStorage = availableStorages.length > 0 ? availableStorages[0] : undefined;
  const baseVariant = variants.find(v => v.color === selectedColor && v.storage_gb === baseStorage && v.processor === selectedProcessor && v.ram_gb === selectedRam) ?? fallbackVariant;
  const basePrice = parseFloat(baseVariant.price);"""
content = content.replace(old_base, new_base)

# Update price format to MAD
content = content.replace('$"', 'MAD "')
content = content.replace("${price.toLocaleString()}", "MAD {price.toLocaleString()}")
content = content.replace("+${priceDiff}", "+MAD {priceDiff}")

# Add new UI selectors before storage selector
old_storage_ui = """          {/* Storage selector */}
          {storageOptions.length > 1 && ("""

new_selectors_ui = """          {/* Processor selector */}
          {processorOptions.length > 1 && (
            <div className="mt-6">
              <h4 className="text-xs font-semibold tracking-wider text-gray-500 uppercase mb-3">Processor</h4>
              <div className="flex flex-wrap gap-2">
                {processorOptions.map((proc) => {
                  const isSelected = selectedProcessor === proc;
                  return (
                    <button
                      key={proc}
                      onClick={() => setSelectedProcessor(proc)}
                      className={`px-4 py-2 text-sm rounded-lg border transition-all duration-200 ${
                        isSelected
                          ? "border-gray-900 text-gray-900 bg-gray-50 shadow-sm"
                          : "border-gray-200 text-gray-600 hover:border-gray-400 hover:bg-gray-50 cursor-pointer"
                      }`}
                    >
                      <span className="font-medium">{proc}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* RAM selector */}
          {availableRams.length > 1 && (
            <div className="mt-6">
              <h4 className="text-xs font-semibold tracking-wider text-gray-500 uppercase mb-3">Memory</h4>
              <div className="flex gap-2">
                {availableRams.map((ram) => {
                  const isSelected = selectedRam === ram;
                  return (
                    <button
                      key={ram}
                      onClick={() => setSelectedRam(ram)}
                      className={`px-4 py-2 text-sm rounded-lg border transition-all duration-200 ${
                        isSelected
                          ? "border-gray-900 text-gray-900 bg-gray-50 shadow-sm"
                          : "border-gray-200 text-gray-600 hover:border-gray-400 hover:bg-gray-50 cursor-pointer"
                      }`}
                    >
                      <span className="font-medium">{ram}GB</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Storage selector */}
          {availableStorages.length > 1 && ("""

content = content.replace(old_storage_ui, new_selectors_ui)

# Update matchVariant logic in Storage selector
old_match = """                  const matchVariant = variants.find(
                    (v) => v.storage_gb === gb && v.color === selectedColor
                  );"""
new_match = """                  const matchVariant = variants.find(
                    (v) => v.storage_gb === gb && v.color === selectedColor && v.processor === selectedProcessor && v.ram_gb === selectedRam
                  );"""
content = content.replace(old_match, new_match)

# Storage options loop needs to use availableStorages instead of storageOptions
content = content.replace("{[...storageOptions].sort((a, b) => a - b).map((gb) => {", "{[...availableStorages].sort((a, b) => a - b).map((gb) => {")

with open(file_path, "w") as f:
    f.write(content)

# Process ProductCard.tsx
card_path = "c:\\PROJECT\\FIND\\frontend\\src\\components\\ProductCard.tsx"
with open(card_path, "r") as f:
    card_content = f.read()
card_content = card_content.replace('`$${price.toLocaleString()}`', '`MAD ${price.toLocaleString()}`')
with open(card_path, "w") as f:
    f.write(card_content)

# Process Navbar.tsx
nav_path = "c:\\PROJECT\\FIND\\frontend\\src\\components\\Navbar.tsx"
with open(nav_path, "r") as f:
    nav_content = f.read()
nav_content = nav_content.replace('`${price.toLocaleString()}`', '`MAD ${price.toLocaleString()}`')
nav_content = nav_content.replace('${price.toLocaleString()}', 'MAD ${price.toLocaleString()}')
with open(nav_path, "w") as f:
    f.write(nav_content)
