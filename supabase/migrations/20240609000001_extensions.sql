-- eHosp: Extensions & schemas
create extension if not exists "uuid-ossp";
create extension if not exists postgis;
create extension if not exists pgcrypto;

create schema if not exists private;

comment on schema private is 'Security definer functions and internal helpers';
