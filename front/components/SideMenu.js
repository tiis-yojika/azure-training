import Link from 'next/link';

export default function SideMenu({ open, setOpen }) {
  return (
    <>
      <button
        onClick={() => setOpen(!open)}
        style={{
          position: 'fixed',
          top: 20,
          left: 20,
          zIndex: 1001,
          background: 'white',
          border: '1px solid #ccc',
          borderRadius: '4px',
          width: 40,
          height: 40,
          cursor: 'pointer',
        }}
        aria-label="メニュー"
      >
        <span style={{ display: 'block', width: 20, height: 2, background: '#333', margin: '6px auto' }} />
        <span style={{ display: 'block', width: 20, height: 2, background: '#333', margin: '6px auto' }} />
        <span style={{ display: 'block', width: 20, height: 2, background: '#333', margin: '6px auto' }} />
      </button>
      <nav
        style={{
          position: 'fixed',
          top: 0,
          left: open ? 0 : '-180px',
          width: 180,
          height: '100%',
          background: '#fff',
          borderRight: '1px solid #ccc',
          transition: 'left 0.2s',
          zIndex: 1000,
          paddingTop: 60,
          pointerEvents: open ? 'auto' : 'none',
        }}
        aria-hidden={!open}
      >
        <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
          <li style={{ margin: '1em' }}>
            <Link href="/event" style={{ color: '#000' }} onClick={() => setOpen(false)}>
              イベント一覧
            </Link>
          </li>
          <li style={{ margin: '1em' }}>
            <Link href="/event/create" style={{ color: '#000' }} onClick={() => setOpen(false)}>
              イベント作成
            </Link>
          </li>
          <li style={{ margin: '1em' }}>
            <Link href="/event/created" style={{ color: '#000' }} onClick={() => setOpen(false)}>
              イベント編集
            </Link>
          </li>
        </ul>
      </nav>
    </>
  );
}