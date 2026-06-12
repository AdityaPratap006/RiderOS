-- Seed: bike_types (matches GraphQL BikeType enum, snake_case)
insert into bike_types (name) values
  ('SUPERSPORT'),
  ('SPORT_NAKED'),
  ('ADVENTURE_TOURER_OFFROAD'),
  ('ADVENTURE_TOURER_HIGHWAY'),
  ('COMMUTER'),
  ('SUPERMOTO'),
  ('ENDURO'),
  ('CRUISER'),
  ('NEO_RETRO'),
  ('SCRAMBLER'),
  ('HYPER_TOURER');


-- Seed: bike_type_route_fit
insert into bike_type_route_fit (bike_type_id, surface_preference, weather_tolerance, hazard_tolerance, notes_template)
select id, 'tarmac',   'low',    'low',    'Best on smooth tarmac — avoid rain and rough roads'     from bike_types where name = 'SUPERSPORT';
insert into bike_type_route_fit (bike_type_id, surface_preference, weather_tolerance, hazard_tolerance, notes_template)
select id, 'tarmac',   'low',    'low',    'Exposed ergonomics — rain and wind hit harder'           from bike_types where name = 'SPORT_NAKED';
insert into bike_type_route_fit (bike_type_id, surface_preference, weather_tolerance, hazard_tolerance, notes_template)
select id, 'off-road', 'high',   'high',   'Built for rough terrain — thrives where others struggle' from bike_types where name = 'ADVENTURE_TOURER_OFFROAD';
insert into bike_type_route_fit (bike_type_id, surface_preference, weather_tolerance, hazard_tolerance, notes_template)
select id, 'mixed',    'high',   'medium', 'Long-haul capable — handles mixed surfaces and weather'  from bike_types where name = 'ADVENTURE_TOURER_HIGHWAY';
insert into bike_type_route_fit (bike_type_id, surface_preference, weather_tolerance, hazard_tolerance, notes_template)
select id, 'tarmac',   'medium', 'medium', 'All-rounder — comfortable across typical city and highway conditions' from bike_types where name = 'COMMUTER';
insert into bike_type_route_fit (bike_type_id, surface_preference, weather_tolerance, hazard_tolerance, notes_template)
select id, 'mixed',    'medium', 'medium', 'Urban agility with light off-road capability'            from bike_types where name = 'SUPERMOTO';
insert into bike_type_route_fit (bike_type_id, surface_preference, weather_tolerance, hazard_tolerance, notes_template)
select id, 'off-road', 'high',   'high',   'Pure off-road — roads with potholes or mud are no issue' from bike_types where name = 'ENDURO';
insert into bike_type_route_fit (bike_type_id, surface_preference, weather_tolerance, hazard_tolerance, notes_template)
select id, 'tarmac',   'low',    'low',    'Low-slung — wind and rain affect comfort significantly'  from bike_types where name = 'CRUISER';
insert into bike_type_route_fit (bike_type_id, surface_preference, weather_tolerance, hazard_tolerance, notes_template)
select id, 'tarmac',   'low',    'low',    'Classic style — best kept for dry, smooth roads'         from bike_types where name = 'NEO_RETRO';
insert into bike_type_route_fit (bike_type_id, surface_preference, weather_tolerance, hazard_tolerance, notes_template)
select id, 'mixed',    'medium', 'medium', 'Light off-road spirit — handles gravel and mild bumps'   from bike_types where name = 'SCRAMBLER';
insert into bike_type_route_fit (bike_type_id, surface_preference, weather_tolerance, hazard_tolerance, notes_template)
select id, 'tarmac',   'medium', 'low',    'Long-distance tourer — stable at highway speed but smooth roads preferred' from bike_types where name = 'HYPER_TOURER';


-- Seed: bikes (India-market focused initial catalogue)
insert into bikes (name, brand, bike_type_id, specs, dealer_url) values
  ('Splendor Plus', 'Hero', (select id from bike_types where name = 'COMMUTER'),
   '{"engine_cc": 97, "power_bhp": 8.02, "torque_nm": 8.05, "weight_kg": 111, "fuel_tank_l": 9.8}',
   'https://www.heromotocorp.com/en-in/bikes/splendor-plus.html'),

  ('Classic 350', 'Royal Enfield', (select id from bike_types where name = 'CRUISER'),
   '{"engine_cc": 349, "power_bhp": 20.2, "torque_nm": 27, "weight_kg": 195, "fuel_tank_l": 13}',
   'https://www.royalenfield.com/in/en/motorcycles/classic-350/'),

  ('Duke 390', 'KTM', (select id from bike_types where name = 'SPORT_NAKED'),
   '{"engine_cc": 399, "power_bhp": 46, "torque_nm": 39, "weight_kg": 163, "fuel_tank_l": 13.4}',
   'https://www.ktmindia.com/motorcycles/duke/duke-390'),

  ('Pulsar NS200', 'Bajaj', (select id from bike_types where name = 'SPORT_NAKED'),
   '{"engine_cc": 199, "power_bhp": 24.5, "torque_nm": 18.74, "weight_kg": 156, "fuel_tank_l": 12}',
   'https://www.bajajauto.com/bikes/pulsar-ns200'),

  ('XPulse 200T', 'Hero', (select id from bike_types where name = 'ADVENTURE_TOURER_HIGHWAY'),
   '{"engine_cc": 199, "power_bhp": 18.4, "torque_nm": 17.35, "weight_kg": 157, "fuel_tank_l": 13}',
   'https://www.heromotocorp.com/en-in/bikes/xpulse-200-4v.html'),

  ('Himalayan 450', 'Royal Enfield', (select id from bike_types where name = 'ADVENTURE_TOURER_OFFROAD'),
   '{"engine_cc": 452, "power_bhp": 40.02, "torque_nm": 40, "weight_kg": 196, "fuel_tank_l": 17}',
   'https://www.royalenfield.com/in/en/motorcycles/himalayan/'),

  ('Apache RTR 200 4V', 'TVS', (select id from bike_types where name = 'SPORT_NAKED'),
   '{"engine_cc": 197, "power_bhp": 20.8, "torque_nm": 17.25, "weight_kg": 153, "fuel_tank_l": 12}',
   'https://www.tvsmotor.com/tvs-apache/tvs-apache-rtr-200-4v/'),

  ('Meteor 350', 'Royal Enfield', (select id from bike_types where name = 'CRUISER'),
   '{"engine_cc": 349, "power_bhp": 20.2, "torque_nm": 27, "weight_kg": 191, "fuel_tank_l": 15}',
   'https://www.royalenfield.com/in/en/motorcycles/meteor-350/'),

  ('CB300R', 'Honda', (select id from bike_types where name = 'NEO_RETRO'),
   '{"engine_cc": 286, "power_bhp": 30.87, "torque_nm": 27.5, "weight_kg": 144, "fuel_tank_l": 10}',
   'https://www.honda2wheelersindia.com/bikes/cb300r'),

  ('Scrambler Icon', 'Ducati', (select id from bike_types where name = 'SCRAMBLER'),
   '{"engine_cc": 803, "power_bhp": 73, "torque_nm": 65, "weight_kg": 186, "fuel_tank_l": 13.5}',
   'https://www.ducati.com/in/en/bikes/scrambler/scrambler-icon');
