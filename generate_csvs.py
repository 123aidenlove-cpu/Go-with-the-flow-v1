import os
import csv

output_dir = r"C:\Users\123ai\OneDrive\Aiden\teaching_app\Curriculum_Templates"
os.makedirs(output_dir, exist_ok=True)

instruments = [
    "Flute", "Oboe", "Clarinet", "Alto Saxophone", "Tenor Saxophone", 
    "Trumpet", "French Horn", "Trombone", "Euphonium", "Tuba",
    "Violin", "Viola", "Cello", "Double Bass", "Mallet Percussion"
]

instructions = [
    "INSTRUCTIONS:",
    "1. Level: Type the curriculum level this note belongs to (e.g., 1, 2, 3). Group notes that are taught together in the same level.",
    "2. Written Note: The scientific pitch notation of the written note (e.g. C4, D4, F#4).",
    "3. Fingering Code: The instrument-specific code for the fingering visualizer (e.g. 'T,123,123' or 'Valve 1,2').",
    "4. Description: A short sentence explaining how to play it.",
    "5. Tip: A pedagogical tip for avoiding common mistakes.",
    "---"
]

headers = ["Level", "Written Note", "Fingering Code", "Description", "Pedagogical Tip"]

example_row = ["1", "E4", "T,1__", "Thumb and first finger of left hand.", "Keep your fingers curved!"]

for instrument in instruments:
    file_path = os.path.join(output_dir, f"{instrument}_Curriculum.csv")
    with open(file_path, mode='w', newline='', encoding='utf-8') as f:
        writer = csv.writer(f)
        for line in instructions:
            writer.writerow([line])
        writer.writerow(headers)
        if instrument == "Clarinet":
            writer.writerow(["1", "E4", "T,1__", "Thumb and top left finger.", "Cover the holes completely."])
            writer.writerow(["1", "D4", "T,12_", "Thumb and top two left fingers.", "Don't let your fingers fly away."])
            writer.writerow(["1", "C4", "T,123", "Thumb and all three left fingers.", "Keep your right hand ready."])
        else:
            writer.writerow(example_row)

print("CSV Templates generated successfully in Curriculum_Templates folder.")
