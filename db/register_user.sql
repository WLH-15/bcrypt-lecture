insert into members (
    email,
    password
) values (
    $1,
    $2
)
returning member_id, email;