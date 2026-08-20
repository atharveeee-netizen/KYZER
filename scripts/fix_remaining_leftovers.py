import os

def write(path, content):
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, 'w', encoding='utf-8') as f:
        f.write(content.strip() + '\n')
    print(f'Wrote {path}')

# 1. Update OperationsDrawer.tsx
with open('frontend/src/components/tactical/OperationsDrawer.tsx', 'r', encoding='utf-8') as f:
    ops = f.read()

ops = ops.replace(
    '''                  <tr>
                    <td className="p-2.5 font-bold text-[#F5F8FA]">Classical OR-Tools Guided Local Search</td>
                    <td className="p-2.5 text-[#F5F8FA]">178.26 km</td>
                    <td className="p-2.5 text-[#D9822B]">420.0 ms</td>
                    <td className="p-2.5 text-[#A7B6C2]">1.0x (Baseline)</td>
                    <td className="p-2.5"><Badge variant="neutral" size="xs">CPU BOUND</Badge></td>
                  </tr>
                  <tr className="bg-[#106BA3]/10">
                    <td className="p-2.5 font-bold text-[#38BDF8]">OR-Tools Guided Local Search (Thermal Physics)</td>
                    <td className="p-2.5 font-bold text-[#0D8050]">178.26 km</td>
                    <td className="p-2.5 font-bold text-[#0D8050]">12.66 ms</td>
                    <td className="p-2.5 font-bold text-[#0D8050]">33.2x FASTER</td>
                    <td className="p-2.5"><Badge variant="success" size="xs">OPTIMAL</Badge></td>
                  </tr>''',
    '''                  <tr>
                    <td className="p-2.5 font-bold text-[#F5F8FA]">Unoptimized Greedy Routing (Dijkstra)</td>
                    <td className="p-2.5 text-[#D9822B]">120.37 km</td>
                    <td className="p-2.5 text-[#A7B6C2]">12.4 ms</td>
                    <td className="p-2.5 text-[#A7B6C2]">1.0x (Baseline)</td>
                    <td className="p-2.5"><Badge variant="warning" size="xs">SUB-OPTIMAL</Badge></td>
                  </tr>
                  <tr className="bg-[#106BA3]/10">
                    <td className="p-2.5 font-bold text-[#38BDF8]">PostGIS KNN + OR-Tools (Thermal Physics)</td>
                    <td className="p-2.5 font-bold text-[#0D8050]">105.09 km</td>
                    <td className="p-2.5 font-bold text-[#0D8050]">342.0 ms</td>
                    <td className="p-2.5 font-bold text-[#0D8050]">WHO COMPLIANT</td>
                    <td className="p-2.5"><Badge variant="success" size="xs">OPTIMAL</Badge></td>
                  </tr>'''
)

write('frontend/src/components/tactical/OperationsDrawer.tsx', ops)

# 2. Update mockData.ts
with open('frontend/src/data/mockData.ts', 'r', encoding='utf-8') as f:
    mock = f.read()

mock = mock.replace(
    "runtime_ms: 12.66,",
    "runtime_ms: 342.0,"
).replace(
    '''  {
    id: 'step-3',
    agent_name: 'AllocatorAgent',
    pill_type: 'read',
    pill_label: 'Reading',
    action_summary: 'Formulates QUBO Hamiltonian and dispatches to IBM Quantum QAOA circuit simulator.',
    telemetry_code: 'QAOA.solve(nodes=4, qubits=16, depth=2) -> Energy: -47.30, Tour: [0, 2, 1, 0], Dist: 79.69km',
    elapsed_ms: 12.66,
    status: 'COMPLETED'
  },''',
    '''  {
    id: 'step-3',
    agent_name: 'AllocatorAgent',
    pill_type: 'read',
    pill_label: 'Reading',
    action_summary: 'Executes PostGIS Spatial KNN query and solves multi-stop CVRPTW with OR-Tools.',
    telemetry_code: 'PostGIS.knn(origin="PHC-PUN-002", k=3) -> Donor: PHC-PUN-004 (9.8km), ORTools.solve() -> Tour: 105.1km',
    elapsed_ms: 42.0,
    status: 'COMPLETED'
  },'''
)

write('frontend/src/data/mockData.ts', mock)

# 3. Update InventoryTab.tsx
with open('frontend/src/components/tabs/InventoryTab.tsx', 'r', encoding='utf-8') as f:
    inv = f.read()

inv = inv.replace(
    "facility_id: 'DH-DEPOT-001',",
    "facility_id: 'PHC-PUN-001',"
).replace(
    "facility_name: 'Aundh Central Depot',",
    "facility_name: 'Shirur Sub-District Hospital Depot',"
)

write('frontend/src/components/tabs/InventoryTab.tsx', inv)

# 4. Update docs/CAREDOM_PITCH_DECK.md
with open('docs/CAREDOM_PITCH_DECK.md', 'r', encoding='utf-8') as f:
    deck = f.read()

deck = deck.replace(
    'dispatch order saving 13.5 km transit.',
    'dispatch order within 18 minutes (9.8 km).'
).replace(
    '[04 ALLOCATION]   ➔ PostGIS KNN + 156-Qubit IBM Heron r2 QAOA Quantum VRP',
    '[04 ALLOCATION]   ➔ PostGIS KNN Spatial Indexing + Google OR-Tools CVRPTW'
).replace(
    'IBM Quantum QPU for multi-facility route optimization,',
    'PostGIS spatial KNN and Google OR-Tools for thermal cold-chain route optimization,'
).replace(
    '(Planner ➔ Critic ➔ QPU)',
    '(Planner ➔ Critic ➔ OR-Tools)'
).replace(
    'matches nearest surplus donors via PostGIS KNN, solves the cold-chain vehicle route on IBM Quantum hardware,',
    'matches nearest surplus donors via PostGIS KNN, solves thermal cold-chain vehicle routes via Google OR-Tools,'
).replace(
    '│   │ 0% VACCINE SPOILAGE      │  │ 13.5 KM TRANSIT SAVED    │  │ 97% BANDWIDTH SAVINGS  │  │\n│   │ All delivery runs within │  │ 8.9% faster emergency     │  │ Client-side canvas     │  │\n│   │ WHO 240-minute window.   │  │ turnaround per route.    │  │ compression for 2G/3G. │  │',
    '│   │ 0% VACCINE SPOILAGE      │  │ 9.8 KM NEAREST DONOR     │  │ 97% BANDWIDTH SAVINGS  │  │\n│   │ All delivery runs within │  │ PostGIS KNN resolves     │  │ Client-side canvas     │  │\n│   │ WHO 240-minute window.   │  │ donor in under 50ms.     │  │ compression for 2G/3G. │  │'
).replace(
    '0% cold-chain vaccine spoilage across simulated monsoon shocks, 13.5 km saved per route, 97% mobile bandwidth reduction',
    '0% cold-chain vaccine spoilage across simulated monsoon shocks, sub-50ms nearest donor matching at 9.8 km, 97% mobile bandwidth reduction'
).replace(
    '• Person 1 (Atharve): AI Engine, SEIR LightGBM, TreeSHAP & IBM Quantum QAOA',
    '• Person 1 (Atharve): AI Engine, SEIR LightGBM, TreeSHAP & Spatial OR-Tools'
)

write('docs/CAREDOM_PITCH_DECK.md', deck)

print('All 4 leftovers updated successfully!')