import yaml

with open('docker-compose.yml', 'r') as f:
    data = yaml.safe_load(f)

services = data.get('services', {})

# 1. Update auth-service
auth = services.get('cinestar-auth-service')
if auth:
    auth['environment'] = ['JAVA_TOOL_OPTIONS=-Xms128m -Xmx384m -XX:+UseContainerSupport'] + [e for e in auth['environment'] if not e.startswith('JAVA_TOOL_OPTIONS')]
    auth['deploy'] = {'resources': {'limits': {'cpus': '1.0', 'memory': '512M'}}}

# 2. Update movie-service
movie = services.get('cinestar-movie-service')
if movie:
    movie['environment'] = ['JAVA_TOOL_OPTIONS=-Xms128m -Xmx384m -XX:+UseContainerSupport'] + [e for e in movie['environment'] if not e.startswith('JAVA_TOOL_OPTIONS')]
    movie['deploy'] = {'resources': {'limits': {'cpus': '1.0', 'memory': '512M'}}}
    if 'depends_on' not in movie: movie['depends_on'] = {}
    if isinstance(movie['depends_on'], list):
        # convert list to dict
        new_deps = {}
        for item in movie['depends_on']: new_deps[item] = {'condition': 'service_started'}
        movie['depends_on'] = new_deps
    movie['depends_on']['cinestar-auth-service'] = {'condition': 'service_started'}

# 3. Update showtime-service
showtime = services.get('cinestar-showtime-service')
if showtime:
    showtime['environment'] = ['JAVA_TOOL_OPTIONS=-Xms128m -Xmx384m -XX:+UseContainerSupport'] + [e for e in showtime['environment'] if not e.startswith('JAVA_TOOL_OPTIONS')]
    showtime['deploy'] = {'resources': {'limits': {'cpus': '1.0', 'memory': '512M'}}}
    if 'depends_on' not in showtime: showtime['depends_on'] = {}
    if isinstance(showtime['depends_on'], list):
        # convert list to dict
        new_deps = {}
        for item in showtime['depends_on']: new_deps[item] = {'condition': 'service_started'}
        showtime['depends_on'] = new_deps
    showtime['depends_on']['cinestar-movie-service'] = {'condition': 'service_started'}

# 4. Update seat-service
seat = services.get('cinestar-seat-service')
if seat:
    seat['environment'] = ['JAVA_TOOL_OPTIONS=-Xms128m -Xmx384m -XX:+UseContainerSupport'] + [e for e in seat['environment'] if not e.startswith('JAVA_TOOL_OPTIONS')]
    seat['deploy'] = {'resources': {'limits': {'cpus': '1.0', 'memory': '512M'}}}
    if 'depends_on' not in seat: seat['depends_on'] = {}
    if isinstance(seat['depends_on'], list):
        # convert list to dict
        new_deps = {}
        for item in seat['depends_on']: new_deps[item] = {'condition': 'service_started'}
        seat['depends_on'] = new_deps
    seat['depends_on']['cinestar-showtime-service'] = {'condition': 'service_started'}

# 5. Update api-gateway
gateway = services.get('cinestar-api-gateway')
if gateway:
    gateway['deploy'] = {'resources': {'limits': {'cpus': '1.0', 'memory': '256M'}}}
    # gateway depends on seat-service (which cascades back)
    gateway['depends_on'] = {
        'cinestar-seat-service': {'condition': 'service_started'}
    }

class MyDumper(yaml.Dumper):
    def increase_indent(self, flow=False, indentless=False):
        return super(MyDumper, self).increase_indent(flow, False)

with open('docker-compose.yml', 'w') as f:
    yaml.dump(data, f, sort_keys=False, Dumper=MyDumper, default_flow_style=False)

