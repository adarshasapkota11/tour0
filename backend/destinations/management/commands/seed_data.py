from django.core.management.base import BaseCommand

from destinations.models import (
    Activity,
    ActivityCategory,
    Destination,
    DestinationVisitPackage,
)

DESTINATIONS = [
    {
        "name": "Kathmandu Valley",
        "province": "Bagmati",
        "description": "The historic heart of Nepal, dotted with UNESCO World Heritage sites, durbar squares, stupas and bustling local markets.",
        "latitude": "27.717200",
        "longitude": "85.324000",
        "is_featured": True,
    },
    {
        "name": "Pokhara",
        "province": "Gandaki",
        "description": "Nepal's adventure capital beside Phewa Lake with views of the Annapurna range — the country's top spot for paragliding.",
        "latitude": "28.209600",
        "longitude": "83.985600",
        "is_featured": True,
    },
    {
        "name": "Chitwan National Park",
        "province": "Bagmati",
        "description": "A UNESCO-listed jungle paradise for canoe rides, jeep safaris and rhino and tiger spotting.",
        "latitude": "27.531800",
        "longitude": "84.476900",
        "is_featured": True,
    },
    {
        "name": "Lumbini",
        "province": "Lumbini",
        "description": "The birthplace of Lord Buddha and one of the holiest pilgrimage sites in the world.",
        "latitude": "27.482500",
        "longitude": "83.277000",
        "is_featured": False,
    },
    {
        "name": "Nagarkot",
        "province": "Bagmati",
        "description": "A hill station famous for Himalayan sunrises, mountain views and downhill cycling routes.",
        "latitude": "27.714800",
        "longitude": "85.518200",
        "is_featured": False,
    },
    {
        "name": "Bhote Koshi",
        "province": "Bagmati",
        "description": "Home to Nepal's legendary bungee jump from a suspension bridge above the roaring Bhote Koshi river.",
        "latitude": "27.900000",
        "longitude": "85.880000",
        "is_featured": True,
    },
    {
        "name": "Trishuli River",
        "province": "Bagmati",
        "description": "Nepal's most popular rafting river with thrilling Class III rapids and easy access from Kathmandu.",
        "latitude": "27.966700",
        "longitude": "85.133300",
        "is_featured": False,
    },
    {
        "name": "Everest Region",
        "province": "Koshi",
        "description": "The roof of the world — trekking routes leading to Everest Base Camp through Sherpa villages and glaciers.",
        "latitude": "27.687500",
        "longitude": "86.731300",
        "is_featured": True,
    },
    {
        "name": "Mustang",
        "province": "Gandaki",
        "description": "The forbidden kingdom of loess canyons, ancient monasteries and high-altitude mountain biking.",
        "latitude": "28.780400",
        "longitude": "83.723000",
        "is_featured": False,
    },
    {
        "name": "Janakpur",
        "province": "Madhesh",
        "description": "The holy city of the Mithila culture, home to the ornate Janaki Mandir and colourful festivals.",
        "latitude": "26.727100",
        "longitude": "85.924400",
        "is_featured": False,
    },
]

CATEGORIES = [
    {"name": "Adventure", "icon": "🏔"},
    {"name": "Water Sports", "icon": "🛶"},
    {"name": "Cycling", "icon": "🚴"},
    {"name": "Culture & Heritage", "icon": "🏛"},
    {"name": "Hiking & Trekking", "icon": "🥾"},
    {"name": "Scenic", "icon": "🪂"},
]

ACTIVITIES = [
    ("Kathmandu Valley", "Culture & Heritage", "Kathmandu Heritage Walking Tour",
     "A guided walk through Durbar Square, Swayambhunath Stupa and local markets.", 2500.00, "4 hours", 10, "easy", True),
    ("Kathmandu Valley", "Cycling", "City Cycling Tour",
     "Cycle the old city lanes, temples and hidden courtyards of Kathmandu.", 2000.00, "3 hours", 8, "moderate", False),
    ("Bhote Koshi", "Adventure", "Bungee Jumping",
     "A 160-metre free-fall from the iconic Bhote Koshi suspension bridge.", 8500.00, "1 day", 20, "challenging", True),
    ("Bhote Koshi", "Adventure", "Bungee + Zipline Combo",
     "Bungee off the bridge and glide back across the gorge on Nepal's fastest zipline.", 11000.00, "1 day", 15, "challenging", True),
    ("Bhote Koshi", "Adventure", "High-Speed Zipline",
     "Soar across the river canyon at over 120 km/h on Nepal's longest zipline.", 4500.00, "2 hours", 25, "moderate", False),
    ("Pokhara", "Adventure", "Tandem Paragliding",
     "Take off from Sarangkot and soar over Phewa Lake with a certified pilot.", 7500.00, "45 minutes", 30, "moderate", True),
    ("Pokhara", "Adventure", "Zip Flyer",
     "Ride the world's steepest zip line over the Pokhara valley.", 3000.00, "1 hour", 20, "moderate", False),
    ("Pokhara", "Water Sports", "Phewa Lake Canoeing",
     "Paddle across Phewa Lake to the Barahi Temple at sunrise.", 1500.00, "2 hours", 12, "easy", True),
    ("Pokhara", "Adventure", "Rock Climbing",
     "Tackle bolted routes on the Dhuili Khel cliffs with gear and guide included.", 800.00, "3 hours", 10, "moderate", False),
    ("Pokhara", "Cycling", "Pokhara Lake Cycling Tour",
     "Ride the Lakeside trail and countryside with mountain views.", 2500.00, "3 hours", 10, "easy", False),
    ("Pokhara", "Hiking & Trekking", "World Peace Pagoda Hike",
     "Hike to the hilltop stupa overlooking Pokhara and the Annapurna range.", 1200.00, "4 hours", 15, "moderate", False),
    ("Chitwan National Park", "Water Sports", "Rapti River Canoe Ride",
     "Dugout canoe through quiet channels in search of gharial and birds.", 1000.00, "2 hours", 14, "easy", False),
    ("Chitwan National Park", "Adventure", "Jungle Safari",
     "Jeep safari into the park for rhinos, tigers, deer and elephants.", 3000.00, "4 hours", 16, "moderate", True),
    ("Trishuli River", "Water Sports", "Trishuli River Rafting",
     "Raft thrilling Class III rapids on Nepal's classic half-day trip.", 3500.00, "4 hours", 20, "challenging", True),
    ("Lumbini", "Culture & Heritage", "Lumbini Heritage Tour",
     "Visit the Maya Devi Temple, sacred garden and monasteries of the peace city.", 2000.00, "4 hours", 20, "easy", False),
    ("Nagarkot", "Cycling", "Nagarkot Sunrise Cycling",
     "Start before dawn, catch the Himalaya sunrise and descend to Bhaktapur.", 3000.00, "6 hours", 12, "challenging", True),
    ("Nagarkot", "Adventure", "Nagarkot Zip Flyer",
     "Glide above the terraced hills with panoramic Himalayan views.", 3200.00, "1 hour", 18, "easy", False),
    ("Everest Region", "Hiking & Trekking", "Everest Base Camp Trek",
     "The classic 12-day trek to the foot of the world's highest mountain.", 35000.00, "12 days", 20, "challenging", True),
    ("Everest Region", "Scenic", "Everest Helicopter Tour",
     "Fly from Kathmandu to land at Everest Base Camp and Kala Patthar.", 40000.00, "1 day", 6, "easy", False),
    ("Mustang", "Cycling", "Upper Mustang Cycling Expedition",
     "Ride through the forbidden kingdom's canyons and monasteries at altitude.", 45000.00, "8 days", 10, "challenging", False),
    ("Mustang", "Hiking & Trekking", "Lower Mustang Trek",
     "Trek past red cliffs, apple orchards and caves of the Kali Gandaki gorge.", 25000.00, "6 days", 12, "moderate", False),
    ("Janakpur", "Culture & Heritage", "Janakpur Cultural Tour",
     "Explore the golden Janaki Mandir, Vivah Mandap and Mithila art houses.", 1500.00, "3 hours", 15, "easy", True),
]

VISIT_PACKAGES = [
    ("Kathmandu Valley", "Kathmandu Day Pass", 4500.00, 1, "Heritage sites, durbar squares and local markets in one day.", 8),
    ("Kathmandu Valley", "Kathmandu Valley Explorer", 12000.00, 3, "Three days across the valley's seven UNESCO heritage zones.", 12),
    ("Pokhara", "Pokhara Day Pass", 3500.00, 1, "Phewa Lake, World Peace Pagoda and the Lakeside promenade.", 10),
    ("Pokhara", "Pokhara Getaway", 9500.00, 3, "Lake views, sunrise at Sarangkot and two full days of adventure.", 14),
    ("Chitwan National Park", "Chitwan Jungle Day", 4000.00, 1, "Canoe ride, jeep safari and jungle walk in one day.", 12),
    ("Chitwan National Park", "Chitwan Safari Weekend", 11500.00, 3, "Two nights in the park with safaris, walks and birding.", 16),
    ("Lumbini", "Lumbini Pilgrimage Pass", 2500.00, 1, "Maya Devi Temple, the sacred garden and monastery circuit.", 20),
    ("Lumbini", "Lumbini Peace Retreat", 6500.00, 2, "Two days of heritage, meditation and monastery visits.", 15),
    ("Nagarkot", "Nagarkot Sunrise Pass", 2800.00, 1, "Himalayan sunrise from the tower viewpoint with a hill walk.", 12),
    ("Everest Region", "Everest Region Day Pass", 8500.00, 1, "Fly-in, fly-out day visit to the Everest gateway of Lukla.", 8),
    ("Everest Region", "Everest Base Camp Visit", 45000.00, 12, "The full classic trek to Everest Base Camp and Kala Patthar.", 20),
    ("Mustang", "Mustang Discovery Pass", 18000.00, 4, "Canyons, monasteries and the Kali Gandaki gorge.", 10),
    ("Janakpur", "Janakpur Heritage Pass", 1800.00, 1, "Janaki Mandir, Mithila art houses and the holy ghats.", 15),
]


class Command(BaseCommand):
    help = "Seed destinations, categories and activities."

    def handle(self, *args, **options):
        categories = {}
        for data in CATEGORIES:
            category, created = ActivityCategory.objects.get_or_create(name=data["name"], defaults=data)
            categories[data["name"]] = category
            self.stdout.write(f"{'Created' if created else 'Exists'} category: {category.name}")

        destinations = {}
        for data in DESTINATIONS:
            dest, created = Destination.objects.get_or_create(name=data["name"], defaults=data)
            if dest.latitude is None and data.get("latitude"):
                dest.latitude = data["latitude"]
                dest.longitude = data["longitude"]
                dest.save(update_fields=["latitude", "longitude"])
            destinations[data["name"]] = dest
            self.stdout.write(f"{'Created' if created else 'Exists'} destination: {dest.name}")

        for dest_name, cat_name, name, desc, price, duration, capacity, difficulty, featured in ACTIVITIES:
            activity, created = Activity.objects.get_or_create(
                destination=destinations[dest_name],
                name=name,
                defaults={
                    "category": categories[cat_name],
                    "description": desc,
                    "price": price,
                    "duration": duration,
                    "capacity": capacity,
                    "difficulty": difficulty,
                    "is_featured": featured,
                },
            )
            if not created and activity.is_featured != featured:
                activity.is_featured = featured
                activity.save(update_fields=["is_featured"])
            self.stdout.write(f"{'Created' if created else 'Exists'} activity: {activity.name}")

        for dest_name, name, price, days, desc, capacity in VISIT_PACKAGES:
            package, created = DestinationVisitPackage.objects.get_or_create(
                destination=destinations[dest_name],
                name=name,
                defaults={
                    "price": price,
                    "days": days,
                    "description": desc,
                    "capacity": capacity,
                },
            )
            self.stdout.write(f"{'Created' if created else 'Exists'} visit package: {package.name}")

        self.stdout.write(self.style.SUCCESS(
            f"Seeded {Activity.objects.count()} activities, "
            f"{DestinationVisitPackage.objects.count()} visit packages across "
            f"{Destination.objects.count()} destinations in {ActivityCategory.objects.count()} categories."
        ))
