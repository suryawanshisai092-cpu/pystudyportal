import psycopg2

def get_connection():
    conn = psycopg2.connect(
        host="aws-1-ap-southeast-2.pooler.supabase.com",
        database="postgres",
        user="postgres.thrjpdvuxilptoyajxoj",
        password="Surya@7385877691",
        port="6543",
        sslmode="require"
    )
    return conn