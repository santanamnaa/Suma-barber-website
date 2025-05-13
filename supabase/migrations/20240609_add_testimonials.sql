-- Tabel testimonials untuk ulasan pelanggan
create table if not exists testimonials (
    id uuid primary key default uuid_generate_v4 (),
    customer_name text not null,
    service_id uuid references services (id),
    rating integer not null check (
        rating >= 1
        and rating <= 5
    ),
    comment text,
    created_at timestamp
    with
        time zone default now()
);