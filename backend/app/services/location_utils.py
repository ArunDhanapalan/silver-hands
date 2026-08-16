"""
Location utilities for SilverHands distance-based filtering.

Uses locality + city → (lat, lng) lookup table built from well-known
neighbourhoods across all supported cities. Falls back to city-level
centroid when a specific locality is not found.

Distance is computed via the Haversine formula (great-circle distance).
"""

import math
from typing import Optional, Tuple

# ---------------------------------------------------------------------------
# Locality → (lat, lng) coordinate table
# Coordinates are approximate centroids of each neighbourhood.
# ---------------------------------------------------------------------------

LOCALITY_COORDS: dict[str, Tuple[float, float]] = {
    # ---- Chennai ----
    "adyar":            (13.0012, 80.2565),
    "mylapore":         (13.0366, 80.2676),
    "anna nagar":       (13.0850, 80.2101),
    "t. nagar":         (13.0418, 80.2341),
    "t nagar":          (13.0418, 80.2341),
    "velachery":        (12.9815, 80.2180),
    "thiruvanmiyur":    (12.9827, 80.2595),
    "besant nagar":     (13.0002, 80.2665),
    "nungambakkam":     (13.0568, 80.2425),
    "egmore":           (13.0732, 80.2610),
    "ambattur":         (13.1143, 80.1548),
    "porur":            (13.0339, 80.1572),
    "perambur":         (13.1178, 80.2445),
    "kodambakkam":      (13.0531, 80.2252),
    "guindy":           (13.0081, 80.2203),
    "chrompet":         (12.9516, 80.1426),
    "tambaram":         (12.9249, 80.1132),
    "sholinganallur":   (12.9010, 80.2279),
    "perungudi":        (12.9677, 80.2436),
    "siruseri":         (12.8446, 80.2256),
    "manali":           (13.1694, 80.2645),
    "korattur":         (13.1084, 80.1924),
    "villivakkam":      (13.1007, 80.2108),
    "valasaravakkam":   (13.0437, 80.1787),
    "chromepet":        (12.9516, 80.1426),
    "pallavaram":       (12.9677, 80.1516),
    "medavakkam":       (12.9177, 80.2001),
    "keelkatalai":      (12.9531, 80.2161),
    "nanganallur":      (12.9815, 80.2040),
    "zamin pallavaram": (12.9609, 80.1670),

    # ---- Bengaluru ----
    "indiranagar":      (12.9784, 77.6408),
    "koramangala":      (12.9352, 77.6245),
    "jayanagar":        (12.9299, 77.5831),
    "whitefield":       (12.9698, 77.7499),
    "malleshwaram":     (13.0040, 77.5718),
    "rajajinagar":      (12.9918, 77.5508),
    "hebbal":           (13.0354, 77.5978),
    "yeshwanthpur":     (13.0251, 77.5455),
    "banashankari":     (12.9257, 77.5481),
    "jp nagar":         (12.9068, 77.5900),
    "btm layout":       (12.9166, 77.6101),
    "hsr layout":       (12.9116, 77.6473),
    "electronic city":  (12.8399, 77.6770),
    "marathahalli":     (12.9591, 77.6975),
    "kr puram":         (13.0040, 77.6980),
    "bellandur":        (12.9255, 77.6740),
    "sarjapur":         (12.8680, 77.7836),
    "yelahanka":        (13.1007, 77.5963),
    "vijayanagar":      (12.9722, 77.5380),
    "basavanagudi":     (12.9440, 77.5752),

    # ---- Mumbai ----
    "bandra":           (19.0596, 72.8295),
    "dadar":            (19.0178, 72.8478),
    "andheri":          (19.1136, 72.8697),
    "thane":            (19.2183, 72.9781),
    "borivali":         (19.2307, 72.8567),
    "kandivali":        (19.2041, 72.8480),
    "malad":            (19.1872, 72.8484),
    "goregaon":         (19.1663, 72.8526),
    "jogeshwari":       (19.1376, 72.8491),
    "vile parle":       (19.1009, 72.8483),
    "santacruz":        (19.0830, 72.8369),
    "kurla":            (19.0726, 72.8789),
    "powai":            (19.1197, 72.9053),
    "ghatkopar":        (19.0868, 72.9086),
    "mulund":           (19.1750, 72.9557),
    "chembur":          (19.0627, 72.9002),
    "vikhroli":         (19.1010, 72.9299),
    "colaba":           (18.9067, 72.8147),
    "fort":             (18.9345, 72.8350),
    "worli":            (19.0176, 72.8155),

    # ---- Delhi NCR ----
    "south extension":  (28.5672, 77.2270),
    "dwarka":           (28.5733, 77.0389),
    "noida":            (28.5355, 77.3910),
    "gurugram":         (28.4595, 77.0266),
    "lajpat nagar":     (28.5677, 77.2433),
    "rohini":           (28.7041, 77.1025),
    "janakpuri":        (28.6272, 77.0831),
    "pitampura":        (28.7001, 77.1395),
    "saket":            (28.5244, 77.2167),
    "hauz khas":        (28.5535, 77.2046),
    "vasant kunj":      (28.5200, 77.1556),
    "greater kailash":  (28.5479, 77.2459),
    "defence colony":   (28.5722, 77.2297),
    "connaught place":  (28.6315, 77.2167),
    "karol bagh":       (28.6519, 77.1903),

    # ---- Hyderabad ----
    "banjara hills":    (17.4156, 78.4347),
    "jubilee hills":    (17.4239, 78.4082),
    "gachibowli":       (17.4401, 78.3489),
    "secunderabad":     (17.4399, 78.4983),
    "madhapur":         (17.4484, 78.3908),
    "hitec city":       (17.4450, 78.3772),
    "kondapur":         (17.4673, 78.3608),
    "kukatpally":       (17.4849, 78.3996),
    "miyapur":          (17.4977, 78.3582),
    "lb nagar":         (17.3471, 78.5517),
    "dilsukhnagar":     (17.3683, 78.5243),
    "uppal":            (17.4057, 78.5591),
    "sr nagar":         (17.4448, 78.4406),
    "begumpet":         (17.4434, 78.4700),
    "himayatnagar":     (17.4028, 78.4751),

    # ---- Coimbatore ----
    "rs puram":         (10.9958, 76.9614),
    "gandhipuram":      (11.0168, 76.9558),
    "peelamedu":        (10.9976, 77.0248),
    "saibaba colony":   (11.0080, 76.9472),
    "race course":      (10.9900, 77.0010),
    "hope college":     (11.0150, 76.9680),
    "singanallur":      (10.9856, 77.0351),
    "ganapathy":        (11.0209, 77.0069),
    "vadavalli":        (10.9838, 76.8996),

    # ---- Pune ----
    "kothrud":          (18.5074, 73.8076),
    "viman nagar":      (18.5679, 73.9143),
    "aundh":            (18.5590, 73.8078),
    "baner":            (18.5590, 73.7868),
    "kalyani nagar":    (18.5448, 73.9042),
    "hadapsar":         (18.4988, 73.9258),
    "magarpatta":       (18.5118, 73.9291),
    "wakad":            (18.5910, 73.7614),
    "hinjewadi":        (18.5910, 73.7350),
    "pimple saudagar":  (18.5944, 73.7987),
    "shivaji nagar":    (18.5314, 73.8446),
    "pune cantonment":  (18.5177, 73.8815),

    # ---- Jaipur ----
    "c-scheme":         (26.9011, 75.7870),
    "malviya nagar":    (26.8629, 75.8238),
    "vaishali nagar":   (26.9028, 75.7378),
    "mansarovar":       (26.8628, 75.7573),
    "tonk road":        (26.8733, 75.8174),
    "jagatpura":        (26.8323, 75.8397),
    "sanganer":         (26.8227, 75.7868),
    "sitapura":         (26.7945, 75.8237),

    # ---- Madurai ----
    "kk nagar":         (9.9285,  78.0858),
    "anna nagar madurai":(9.9554, 78.0863),
    "tallakulam":       (9.9336,  78.1178),
    "simmakkal":        (9.9162,  78.1244),
    "chokkikulam":      (9.9337,  78.1176),
    "palanganatham":    (9.8948,  78.1290),

    # ---- Mysuru ----
    "gokulam":          (12.3375, 76.6394),
    "jayalakshmipuram": (12.3168, 76.6406),
    "kuvempunagar":     (12.3095, 76.6580),
    "saraswathipuram":  (12.3261, 76.6337),
    "vijayanagar mysuru":(12.2988,76.6280),

    # ---- Vijayawada ----
    "benz circle":      (16.5063, 80.6330),
    "governorpet":      (16.5105, 80.6239),
    "moghalrajpuram":   (16.5120, 80.6449),
    "labbipet":         (16.5097, 80.6174),
    "suryaraopeta":     (16.5200, 80.6200),

    # ---- Salem ----
    "fairlands":        (11.6643, 78.1460),
    "alagapuram":       (11.6523, 78.1530),
    "hasthampatti":     (11.6921, 78.1581),

    # ---- Tiruchirappalli ----
    "thillai nagar":    (10.7905, 78.7047),
    "srirangam":        (10.8610, 78.6892),

    # ---- Warangal ----
    "hanamkonda":       (17.9989, 79.5941),
    "kazipet":          (17.9559, 79.6049),
    "subedari":         (18.0030, 79.5820),
}

# City-level centroids as fallback
CITY_CENTROIDS: dict[str, Tuple[float, float]] = {
    "chennai":             (13.0827, 80.2707),
    "bengaluru":           (12.9716, 77.5946),
    "bangalore":           (12.9716, 77.5946),
    "mumbai":              (19.0760, 72.8777),
    "delhi ncr":           (28.6139, 77.2090),
    "delhi":               (28.6139, 77.2090),
    "hyderabad":           (17.3850, 78.4867),
    "coimbatore":          (11.0168, 76.9558),
    "pune":                (18.5204, 73.8567),
    "jaipur":              (26.9124, 75.7873),
    "madurai":             (9.9252,  78.1198),
    "mysuru":              (12.2958, 76.6394),
    "vijayawada":          (16.5062, 80.6480),
    "salem":               (11.6643, 78.1460),
    "tiruchirappalli":     (10.7905, 78.7047),
    "trichy":              (10.7905, 78.7047),
    "warangal":            (17.9689, 79.5941),
}


def _get_coords(locality: str, city: str) -> Optional[Tuple[float, float]]:
    """Resolve a locality+city to lat/lng coordinates.
    
    Tries locality lookup first, then city centroid fallback.
    """
    key = locality.strip().lower()
    if key in LOCALITY_COORDS:
        return LOCALITY_COORDS[key]

    # Try matching just the first word of locality (handles "Adyar, Chennai" inputs)
    key_first = key.split(",")[0].strip()
    if key_first in LOCALITY_COORDS:
        return LOCALITY_COORDS[key_first]

    # Fall back to city centroid
    city_key = city.strip().lower()
    return CITY_CENTROIDS.get(city_key)


def haversine_km(lat1: float, lng1: float, lat2: float, lng2: float) -> float:
    """Compute great-circle distance in kilometres between two coordinates."""
    R = 6371.0  # Earth radius in km
    phi1, phi2 = math.radians(lat1), math.radians(lat2)
    dphi = math.radians(lat2 - lat1)
    dlambda = math.radians(lng2 - lng1)
    a = math.sin(dphi / 2) ** 2 + math.cos(phi1) * math.cos(phi2) * math.sin(dlambda / 2) ** 2
    return R * 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))


def compute_distance_km(
    from_locality: str, from_city: str,
    to_locality: str, to_city: str
) -> Optional[float]:
    """Compute the km distance between two locality/city pairs.
    
    Returns None if either location cannot be resolved to coordinates.
    """
    src = _get_coords(from_locality, from_city)
    dst = _get_coords(to_locality, to_city)
    if src is None or dst is None:
        return None
    return haversine_km(src[0], src[1], dst[0], dst[1])


def parse_radius_km(travel_radius: str) -> float:
    """Parse a senior's travel_radius preference string into kilometres.
    
    Examples: '5 km' → 5.0,  'Online only' → 0.0,  'Flexible' → 50.0
    """
    if not travel_radius:
        return 5.0
    r = travel_radius.strip().lower()
    if any(kw in r for kw in ["home only", "online", "remote", "0 km"]):
        return 0.0
    # Extract first number found in the string
    import re
    nums = re.findall(r"\d+\.?\d*", r)
    if nums:
        val = float(nums[0])
        # Sanity cap: 100 km max
        return min(val, 100.0)
    if "flexible" in r or "any" in r:
        return 50.0
    return 5.0


def is_within_radius(
    senior_locality: str, senior_city: str,
    item_locality: str, item_city: str,
    max_km: float
) -> bool:
    """Return True if the item location is reachable within senior's travel radius.
    
    - If max_km == 0 → senior is home/online only; all in-person items are EXCLUDED.
    - If either location cannot be resolved → give benefit of doubt and INCLUDE.
    - If distance <= max_km → INCLUDE.
    - Otherwise → EXCLUDE.
    """
    if max_km == 0.0:
        return False  # Online-only senior; exclude all in-person items

    dist = compute_distance_km(senior_locality, senior_city, item_locality, item_city)
    if dist is None:
        # Cannot compute: include with benefit of doubt
        return True
    return dist <= max_km
