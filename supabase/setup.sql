-- RotaKurye ilk kurulum: Al Mawaleh Turkish Coffee Shop
-- Önce Authentication > Users ekranında 3 kullanıcı oluşturulmuş olmalı.

insert into public.restaurants (name, lat, lng)
values ('Al Mawaleh Turkish Coffee Shop', 23.5880, 58.2010);

insert into public.profiles (id, restaurant_id, full_name, role)
select u.id, (select id from public.restaurants order by created_at limit 1), 'Yönetici', 'admin'
from auth.users u where u.email = 'yonetici@rotakurye.com';

insert into public.profiles (id, restaurant_id, full_name, role)
select u.id, (select id from public.restaurants order by created_at limit 1), 'Suhel', 'courier'
from auth.users u where u.email = 'kurye1@rotakurye.com';

insert into public.profiles (id, restaurant_id, full_name, role)
select u.id, (select id from public.restaurants order by created_at limit 1), 'Ahmet', 'courier'
from auth.users u where u.email = 'kurye2@rotakurye.com';

-- Kontrol: 3 satır görmelisiniz
select p.full_name, p.role, u.email from public.profiles p join auth.users u on u.id = p.id;
