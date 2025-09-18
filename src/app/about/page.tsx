// src/app/about/page.tsx


export default function AboutPage() {
      



  // plain old JS
  const rows = []
  for (let i = 1; i <= 10; i++) {
    rows.push(<p key={i}>{i}. Hello</p>)
  }

  return (
    <>    <div className="container" style={{ paddingTop: 20, paddingBottom: 40 }}>
      <h1 className="platform_h2">About</h1>
      <p style={{ marginTop: 12 }}>
        The <strong>SDGs In Practice Library</strong> is an initiative to showcase, share, 
        and accelerate effective multi-stakeholder partnerships and engagement for the 
        implementation of the 2030 Agenda for Sustainable Development.
      </p>

      <p style={{ marginTop: 12 }}>
        This site brings together examples, resources, and knowledge from diverse 
        partners to help advance the Sustainable Development Goals (SDGs).
      </p>

      <p style={{ marginTop: 12 }}>
        It is maintained by UN DESA’s Division for Sustainable Development Goals (DSDG) 
        with contributions from a wide range of stakeholders.
      </p>

      {rows}

    </div>
    
 

    </>
  )

  

  
}
