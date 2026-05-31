# Storage Unit Inventory Prompt

Paste this into a fresh Claude session when ready to run an inventory pass.

---

You are helping me build a simple photo based inventory and organization system for my storage unit for Genesis Executive Home Services.

The goal is not to create a perfect electrical inventory tonight. The goal is to create a simple, repeatable system that lets a non electrician take pictures, sort similar items, and keep track of where things ended up.

Important rules:
Do not delete any photos.
Do not overwrite any files.
Preserve the original raw photos.
If you are not sure what an item is, label it as UNKNOWN_NEEDS_JEFFREY.
Do not invent exact electrical names unless the item is clearly visible.
Use plain language first. Trade names can be added later.
Every photo should either stay in raw inbox or be copied into the most likely folder.
If you move anything, keep a clear written record of where it went.

Create this folder structure if it does not already exist:

GENESIS_STORAGE_INVENTORY_2026
00_INBOX_RAW_PHOTOS
01_BEFORE_PHOTOS
02_AFTER_PHOTOS
03_UNKNOWN_NEEDS_JEFFREY
04_ZONE_A_ELECTRICAL_MATERIAL
05_ZONE_B_TOOLS_AND_EQUIPMENT
06_ZONE_C_JOB_LEFTOVERS
07_ZONE_D_BULK_STOCK
08_ZONE_E_REVIEW_AND_UNSORTED
99_REPORTS

Inside 99_REPORTS, create a file called STORAGE_UNIT_INVENTORY_LOG.md.

Also create a CSV file called STORAGE_UNIT_PHOTO_INDEX.csv with these columns:
Photo Number
Original File Name
New File Name
Date Processed
Before Or After
Zone
Bin Or Category
Plain Description
Possible Trade Name
Confidence 0 To 100
Action Needed
Notes

Use this naming format for processed photos:
YYYYMMDD_STORAGE_ZONE_CATEGORY_###.jpg

Examples:
20260531_STORAGE_A_DEVICES_001.jpg
20260531_STORAGE_A_BREAKERS_002.jpg
20260531_STORAGE_B_POWER_TOOLS_003.jpg
20260531_STORAGE_E_UNKNOWN_REVIEW_004.jpg

Use these zones:
A: Electrical material
B: Tools and equipment
C: Job leftovers
D: Bulk stock
E: Unknown, needs Jeffrey review

Use these common categories:
Devices
Plates
Breakers
Boxes
Fittings
Wire
Low Voltage
Power Tools
Batteries And Chargers
Hand Tools
Job Leftovers
Bulk Stock
Unknown Electrical
Random Review

For each image in 00_INBOX_RAW_PHOTOS:
1. Look at the image.
2. Decide whether it is a BEFORE photo, AFTER photo, or UNKNOWN.
3. Copy it into the best matching folder.
4. Rename the copied file using the naming format.
5. Add a row to STORAGE_UNIT_PHOTO_INDEX.csv.
6. Add a short plain English note to STORAGE_UNIT_INVENTORY_LOG.md.

Use confidence ratings:
95 to 100 means clearly visible and obvious.
75 to 94 means likely but not perfect.
50 to 74 means uncertain.
Below 50 means put it in UNKNOWN_NEEDS_JEFFREY.

Do not spend too much time identifying small individual parts.
The main job is to preserve the photo record and group photos into useful zones.

Tonight is only a test run.
Only process the first 5 to 10 photos unless I specifically tell you to continue.
After processing the test photos, give me:
1. A short summary of what you did.
2. Any files or folders you created.
3. Any photos that need Jeffrey review.
4. Any problems with the system.
5. A recommendation before I use this with the helper tomorrow.
