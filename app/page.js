'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function LandingPage() {
  const router = useRouter()
  const [isYearly, setIsYearly] = useState(false)
  const [activeUseCase, setActiveUseCase] = useState('weddings')
  const [openFaq, setOpenFaq] = useState(0)

  const navLinks = ['Features','How It Works','Use Cases','Pricing','Testimonials','FAQ']

  const features = [
    { icon:'👥', title:'AI Face Recognition', desc:'Guests take a selfie and instantly find all their photos. 99.5% accuracy powered by Artificial Intelligence.', grad:'135deg,#9b7fe8,#c084fc' },
    { icon:'⚡', title:'Instant Photo Delivery', desc:'Photos processed and delivered in real-time. No waiting, no app downloads required.', grad:'135deg,#f472b6,#fb7185' },
    { icon:'🎨', title:'Custom Branding', desc:'White-label galleries with your logo, colors, and domain. Professional for every client.', grad:'135deg,#60a5fa,#818cf8' },
    { icon:'🛒', title:'Built-in Photo Sales', desc:'Sell prints and downloads directly from your gallery. Integrated payments, zero commission.', grad:'135deg,#34d399,#2dd4bf' },
    { icon:'📸', title:'Batch Upload', desc:'Upload 500+ photos at once with live progress tracking. Artificial Intelligence  process in background.', grad:'135deg,#fbbf24,#f97316' },
    { icon:'🎬', title:'AI-Generated Reels', desc:'Auto-create highlight reels from your best shots. Perfect for social sharing after events.', grad:'135deg,#c084fc,#f472b6' },
  ]

  const steps = [
    { n:'01', title:'Create Event', desc:'Set up your event in minutes. Add name, date, location, event type and custom branding.' },
    { n:'02', title:'Upload Photos', desc:'Batch upload from your computer.  Artificial Intelligence runs on every photo automatically.' },
    { n:'03', title:'Share Guest Link', desc:'Copy the QR link and share with guests. They take a selfie to find all their photos instantly.' },
    { n:'04', title:'Deliver & Sell', desc:'Guests download, share, and purchase. You get paid directly with Razorpay integration.' },
  ]

  const useCases = {
    weddings: { title:'Wedding Photography', desc:'Deliver a magical experience to couples and guests. Every attendee finds their photos instantly via face recognition. Perfect for Indian weddings with 500+ guests.', features:['Unlimited guest access','Real-time photo delivery','Custom wedding branding','Print sales integration'] },
    corporate: { title:'Corporate Events', desc:'Professional photo management for conferences, galas, and team events. Branded galleries that impress clients and employees.', features:['Company branding','Bulk download options','Privacy controls','Analytics dashboard'] },
    sports: { title:'Sports Photography', desc:'Capture every athlete in action. Parents and players find their photos instantly with face search — no scrolling through hundreds of shots.', features:['Action shot processing','Team galleries','Package deals','Bulk parent delivery'] },
    concerts: { title:'Concerts & Festivals', desc:'Handle thousands of photos from multi-day events. Fans find themselves in the crowd effortlessly with one selfie.', features:['High volume processing','Multi-photographer support','Social sharing','Merchandise integration'] },
    schools: { title:'School Events', desc:'Graduations, proms, and school events made easy. Safe, secure photo delivery for students and families.', features:['Student verification','Parent access controls','Yearbook integration','Safe delivery'] },
  }

  const plans = [
    { name:'Rider', desc:'Perfect for trying out', price:{ m:450, y:399 }, features:['1 event per month','1,000 photos per event','AI face recognition','Standard galleries','Email support'], popular:false },
    { name:'Pro', desc:'For professional photographers', price:{ m:999, y:799 }, features:['Unlimited events','10,000 photos/event',' AI Face recognition','Full white-label','Zero commission sales','API access','Priority support'], popular:true },
    { name:'Enterprise', desc:'For agencies and studios', price:{ m:1999, y:1599 }, features:['Everything in Pro','Unlimited photos','Multi-user teams','Custom integrations','SLA guarantee'], popular:false },
  ]

  const testimonials = [
    { quote:'Framely transformed how I deliver wedding photos. My clients love finding their photos instantly with just a selfie. The ArcFace accuracy is incredible!', author:'Ramesh Iyer', role:'Wedding Photographer, Pune', rating:5 },
    { quote:'We processed 5,000 photos from our annual corporate event. 98.5% accuracy on Indian faces is something no other tool offers at this price.', author:'Priya Menon', role:'Event Director, Infosys', rating:5 },
    { quote:'The white-label galleries look so professional. My clients think I built a custom app just for them. Worth every rupee.', author:'Suresh Nair', role:'Portrait Studio Owner, Mumbai', rating:5 },
  ]

  const faqs = [
    { q:'How accurate is the face recognition?', a:'99.5% accuracy using Artificial Intelligence Face Recognition System. Works reliably with Indian faces, different lighting, angles, and accessories.' },
    { q:'How do guests access their photos?', a:'Guests open the event link, take a quick selfie, and our AI instantly finds all photos they appear in. No app download required — works on any mobile browser.' },
    { q:'How many photos can I upload?', a:'Our batch uploader handles 500+ photos at once with live progress. AI  process them in parallel — typically 3-5 seconds per photo on CPU.' },
    { q:'Is there a limit on storage?', a:'Rider plan has per-event limits. Pro includes 500GB storage. Enterprise offers unlimited storage served via CDN for fast global delivery.' },
    { q:'Can I white-label the platform?', a:'Yes! Pro and Enterprise plans include full white-labeling — your logo, colors, custom domain, and branded emails. Your clients never see the Framely name.' },
  ]

  return (
    <div style={{
      fontFamily:"'Inter',system-ui,sans-serif",
      minHeight:'100vh',
      background:'linear-gradient(135deg, #ddd6fe 0%, #e9d5ff 20%, #fbcfe8 45%, #fde68a 70%, #fecdd3 85%, #ddd6fe 100%)',
      position:'relative',
      overflowX:'hidden',
    }}>

      {/* Soft radial glow in center like page 1 */}
      <div style={{ position:'fixed', inset:0, background:'radial-gradient(ellipse 80% 60% at 50% 30%, rgba(255,220,200,0.45) 0%, transparent 70%)', pointerEvents:'none', zIndex:0 }} />
      <div style={{ position:'fixed', inset:0, background:'radial-gradient(ellipse 60% 50% at 20% 60%, rgba(200,190,255,0.3) 0%, transparent 60%)', pointerEvents:'none', zIndex:0 }} />

      <div style={{ position:'relative', zIndex:1 }}>

        {/* NAV — white, clean, like page 1 */}
        <header style={{ position:'fixed', top:0, left:0, right:0, zIndex:50, background:'rgba(255,255,255,0.85)', backdropFilter:'blur(12px)', WebkitBackdropFilter:'blur(12px)', borderBottom:'1px solid rgba(0,0,0,0.06)' }}>
          <div style={{ maxWidth:1200, margin:'0 auto', padding:'0 24px', height:64, display:'flex', alignItems:'center', justifyContent:'space-between' }}>
            {/* Logo */}
            <div style={{ display:'flex', alignItems:'center', gap:10 }}>
              <div style={{ width:38, height:38, borderRadius:12, background:'linear-gradient(135deg,#9b7fe8,#c084fc)', display:'flex', alignItems:'center', justifyContent:'center', color:'#fff', fontWeight:800, fontSize:17, boxShadow:'0 3px 12px rgba(155,127,232,0.35)' }}>P</div>
              <span style={{ fontSize:19, fontWeight:800, color:'#2d1b69', letterSpacing:'-.02em' }}>Framely</span>
            </div>

            {/* Links */}
            <div style={{ display:'flex', alignItems:'center', gap:32 }}>
              {navLinks.map(l => (
                <a key={l} href={`#${l.toLowerCase().replace(/ /g,'-')}`}
                  style={{ fontSize:14, color:'#6b7280', textDecoration:'none', fontWeight:500, transition:'color .15s' }}
                  onMouseEnter={e=>e.target.style.color='#2d1b69'}
                  onMouseLeave={e=>e.target.style.color='#6b7280'}>
                  {l}
                </a>
              ))}
            </div>

            {/* Actions */}
            <div style={{ display:'flex', alignItems:'center', gap:12 }}>
              <button onClick={()=>router.push('/login')}
                style={{ padding:'8px 18px', background:'transparent', border:'none', color:'#6b7280', fontSize:14, fontWeight:600, cursor:'pointer' }}>
                Sign In
              </button>
              <button onClick={()=>router.push('/register')}
                style={{ padding:'9px 22px', borderRadius:50, background:'linear-gradient(135deg,#9b7fe8,#c084fc)', color:'#fff', border:'none', fontSize:14, fontWeight:700, cursor:'pointer', boxShadow:'0 4px 14px rgba(155,127,232,0.4)' }}>
                Get Started Free
              </button>
            </div>
          </div>
        </header>

        {/* HERO */}
        <section style={{ paddingTop:160, paddingBottom:80, paddingLeft:20, paddingRight:20, textAlign:'center' }}>
          <div style={{ maxWidth:1100, margin:'0 auto' }}>

            {/* Badge */}
            <div style={{ display:'inline-flex', alignItems:'center', gap:7, background:'rgba(255,255,255,0.6)', backdropFilter:'blur(10px)', border:'1px solid rgba(255,255,255,0.8)', padding:'8px 18px', borderRadius:50, marginBottom:28, boxShadow:'0 2px 12px rgba(0,0,0,0.06)' }}>
              <span style={{ fontSize:14 }}>✨</span>
              <span style={{ fontSize:13, color:'#7c6aaa', fontWeight:500 }}>AI-Powered Photo Management</span>
            </div>

            {/* Headline — stacked like page 1 */}
            <h1 style={{ fontSize:'clamp(48px,7vw,80px)', fontWeight:800, color:'#2d1b69', letterSpacing:'-.04em', lineHeight:1.05, marginBottom:20 }}>
              Event Photos,
              <br/>
              <span style={{ background:'linear-gradient(135deg,#9b7fe8 0%,#c084fc 40%,#f472b6 80%,#fb923c 100%)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', backgroundClip:'text' }}>
                Delivered Instantly
              </span>
            </h1>

            <p style={{ fontSize:'clamp(15px,2vw,18px)', color:'#7c6aaa', maxWidth:560, margin:'0 auto 36px', lineHeight:1.75 }}>
              The complete AI photo platform for events. Face recognition finds every guest's photos automatically. Beautiful galleries, instant delivery, seamless selling.
            </p>

            {/* CTA buttons */}
            <div style={{ display:'flex', gap:14, justifyContent:'center', flexWrap:'wrap', marginBottom:72 }}>
              <button onClick={()=>router.push('/register')}
                style={{ padding:'15px 34px', borderRadius:50, background:'linear-gradient(135deg,#9b7fe8,#c084fc)', color:'#fff', border:'none', fontSize:16, fontWeight:700, cursor:'pointer', boxShadow:'0 6px 24px rgba(155,127,232,0.45)', display:'flex', alignItems:'center', gap:8, transition:'all .2s' }}
                onMouseEnter={e=>e.currentTarget.style.boxShadow='0 8px 32px rgba(155,127,232,0.6)'}
                onMouseLeave={e=>e.currentTarget.style.boxShadow='0 6px 24px rgba(155,127,232,0.45)'}>
                Start Free Trial <span style={{ fontSize:18 }}>›</span>
              </button>
              <button style={{ padding:'15px 34px', borderRadius:50, background:'rgba(255,255,255,0.65)', backdropFilter:'blur(10px)', border:'1px solid rgba(255,255,255,0.9)', color:'#2d1b69', fontSize:16, fontWeight:600, cursor:'pointer', boxShadow:'0 4px 16px rgba(0,0,0,0.08)' }}>
                Watch Demo
              </button>
            </div>

            {/* Stats — clean cards like page 1 */}
            <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:14, maxWidth:900, margin:'0 auto' }}>
              {[{v:'10M+',l:'Photos Processed'},{v:'99.5%',l:'Face Recognition Accuracy'},{v:'50K+',l:'Events Hosted'},{v:'4.9/5',l:'Customer Rating'}].map((s,i)=>(
                <div key={i} style={{ background:'rgba(255,255,255,0.55)', backdropFilter:'blur(12px)', border:'1px solid rgba(255,255,255,0.8)', borderRadius:20, padding:'22px 16px', textAlign:'center', boxShadow:'0 4px 20px rgba(0,0,0,0.05)' }}>
                  <div style={{ fontSize:'clamp(28px,3vw,36px)', fontWeight:800, color:'#2d1b69', letterSpacing:'-.03em', marginBottom:5 }}>{s.v}</div>
                  <div style={{ fontSize:12, color:'#9b89c4', fontWeight:500 }}>{s.l}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FEATURES */}
        <section id="features" style={{ padding:'80px 20px' }}>
          <div style={{ maxWidth:1200, margin:'0 auto' }}>
            <div style={{ textAlign:'center', marginBottom:56 }}>
              <h2 style={{ fontSize:'clamp(28px,4vw,48px)', fontWeight:800, color:'#2d1b69', letterSpacing:'-.03em', marginBottom:14 }}>Everything You Need</h2>
              <p style={{ fontSize:16, color:'#7c6aaa', maxWidth:540, margin:'0 auto' }}>Powerful features designed for professional photographers and event organizers</p>
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(320px,1fr))', gap:18 }}>
              {features.map((f,i)=>(
                <div key={i} style={{ background:'rgba(255,255,255,0.5)', backdropFilter:'blur(16px)', border:'1px solid rgba(255,255,255,0.75)', borderRadius:22, padding:'32px 28px', transition:'all .2s', cursor:'default' }}
                  onMouseEnter={e=>{ e.currentTarget.style.background='rgba(255,255,255,0.7)'; e.currentTarget.style.transform='translateY(-3px)'; e.currentTarget.style.boxShadow='0 12px 36px rgba(155,127,232,0.15)' }}
                  onMouseLeave={e=>{ e.currentTarget.style.background='rgba(255,255,255,0.5)'; e.currentTarget.style.transform='translateY(0)'; e.currentTarget.style.boxShadow='none' }}>
                  <div style={{ width:54, height:54, borderRadius:18, background:`linear-gradient(${f.grad})`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:24, marginBottom:18, boxShadow:'0 6px 18px rgba(155,127,232,0.25)' }}>{f.icon}</div>
                  <h3 style={{ fontSize:18, fontWeight:700, color:'#2d1b69', marginBottom:10 }}>{f.title}</h3>
                  <p style={{ fontSize:14, color:'#7c6aaa', lineHeight:1.75 }}>{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* HOW IT WORKS */}
        <section id="how-it-works" style={{ padding:'80px 20px' }}>
          <div style={{ maxWidth:1200, margin:'0 auto' }}>
            <div style={{ textAlign:'center', marginBottom:56 }}>
              <h2 style={{ fontSize:'clamp(28px,4vw,48px)', fontWeight:800, color:'#2d1b69', letterSpacing:'-.03em', marginBottom:14 }}>How It Works</h2>
              <p style={{ fontSize:16, color:'#7c6aaa' }}>From upload to delivery in four simple steps</p>
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(220px,1fr))', gap:16 }}>
              {steps.map((s,i)=>(
                <div key={i} style={{ background:'rgba(255,255,255,0.5)', backdropFilter:'blur(16px)', border:'1px solid rgba(255,255,255,0.75)', borderRadius:22, padding:'28px 24px' }}>
                  <div style={{ fontSize:52, fontWeight:800, color:'rgba(155,127,232,0.18)', marginBottom:12, lineHeight:1, letterSpacing:'-.04em' }}>{s.n}</div>
                  <h3 style={{ fontSize:17, fontWeight:700, color:'#2d1b69', marginBottom:10 }}>{s.title}</h3>
                  <p style={{ fontSize:13, color:'#7c6aaa', lineHeight:1.75 }}>{s.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* USE CASES */}
        <section id="use-cases" style={{ padding:'80px 20px' }}>
          <div style={{ maxWidth:1200, margin:'0 auto' }}>
            <div style={{ textAlign:'center', marginBottom:56 }}>
              <h2 style={{ fontSize:'clamp(28px,4vw,48px)', fontWeight:800, color:'#2d1b69', letterSpacing:'-.03em', marginBottom:14 }}>Built for Every Event</h2>
              <p style={{ fontSize:16, color:'#7c6aaa' }}>From intimate weddings to massive festivals, Framely scales to meet your needs</p>
            </div>
            <div style={{ display:'flex', gap:8, justifyContent:'center', flexWrap:'wrap', marginBottom:32 }}>
              {Object.keys(useCases).map(k=>(
                <button key={k} onClick={()=>setActiveUseCase(k)}
                  style={{ padding:'10px 24px', borderRadius:50, fontSize:13, fontWeight:600, cursor:'pointer', border:'none', background:activeUseCase===k?'linear-gradient(135deg,#9b7fe8,#c084fc)':'rgba(255,255,255,0.55)', color:activeUseCase===k?'#fff':'#7c6aaa', boxShadow:activeUseCase===k?'0 4px 16px rgba(155,127,232,0.4)':'none', transition:'all .2s', backdropFilter:'blur(10px)' }}>
                  {k.charAt(0).toUpperCase()+k.slice(1)}
                </button>
              ))}
            </div>
            <div style={{ background:'rgba(255,255,255,0.5)', backdropFilter:'blur(20px)', border:'1px solid rgba(255,255,255,0.75)', borderRadius:28, padding:'40px 44px' }}>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:48, alignItems:'center' }}>
                <div>
                  <h3 style={{ fontSize:28, fontWeight:800, color:'#2d1b69', letterSpacing:'-.03em', marginBottom:14 }}>{useCases[activeUseCase].title}</h3>
                  <p style={{ fontSize:15, color:'#7c6aaa', lineHeight:1.75, marginBottom:24 }}>{useCases[activeUseCase].desc}</p>
                  <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
                    {useCases[activeUseCase].features.map((f,i)=>(
                      <div key={i} style={{ display:'flex', alignItems:'center', gap:10 }}>
                        <div style={{ width:24, height:24, borderRadius:8, background:'linear-gradient(135deg,#34d399,#2dd4bf)', display:'flex', alignItems:'center', justifyContent:'center', color:'#fff', fontSize:12, flexShrink:0 }}>✓</div>
                        <span style={{ fontSize:14, color:'#2d1b69', fontWeight:500 }}>{f}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div style={{ background:'rgba(255,255,255,0.45)', backdropFilter:'blur(12px)', border:'1px solid rgba(255,255,255,0.7)', borderRadius:22, aspectRatio:'16/10', display:'flex', alignItems:'center', justifyContent:'center' }}>
                  <div style={{ textAlign:'center' }}>
                    <div style={{ width:72, height:72, borderRadius:22, background:'linear-gradient(135deg,#9b7fe8,#c084fc)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:32, margin:'0 auto 12px', boxShadow:'0 8px 24px rgba(155,127,232,0.35)' }}>📸</div>
                    <p style={{ fontSize:13, color:'#9b89c4' }}>Live Event Preview</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* PRICING */}
        <section id="pricing" style={{ padding:'80px 20px' }}>
          <div style={{ maxWidth:1100, margin:'0 auto' }}>
            <div style={{ textAlign:'center', marginBottom:48 }}>
              <h2 style={{ fontSize:'clamp(28px,4vw,48px)', fontWeight:800, color:'#2d1b69', letterSpacing:'-.03em', marginBottom:14 }}>Simple, Transparent Pricing</h2>
              <p style={{ fontSize:16, color:'#7c6aaa', marginBottom:28 }}>Start free and scale as you grow. Prices in INR. No hidden fees.</p>
              <div style={{ display:'inline-flex', background:'rgba(255,255,255,0.55)', backdropFilter:'blur(10px)', border:'1px solid rgba(255,255,255,0.75)', borderRadius:50, padding:4 }}>
                {['Monthly','Yearly'].map((t,i)=>(
                  <button key={t} onClick={()=>setIsYearly(i===1)}
                    style={{ padding:'9px 24px', borderRadius:50, fontSize:13, fontWeight:600, cursor:'pointer', border:'none', background:(isYearly&&i===1)||(!isYearly&&i===0)?'linear-gradient(135deg,#9b7fe8,#c084fc)':'transparent', color:(isYearly&&i===1)||(!isYearly&&i===0)?'#fff':'#7c6aaa', transition:'all .2s' }}>
                    {t}{i===1&&<span style={{ marginLeft:4, color:isYearly?'rgba(255,255,255,0.8)':'#34d399' }}>-20%</span>}
                  </button>
                ))}
              </div>
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:20 }}>
              {plans.map((p,i)=>(
                <div key={i} style={{ borderRadius:28, padding:'32px 28px', position:'relative', ...(p.popular ? { background:'linear-gradient(135deg,#9b7fe8,#c084fc)', boxShadow:'0 16px 48px rgba(155,127,232,0.45)' } : { background:'rgba(255,255,255,0.55)', backdropFilter:'blur(16px)', border:'1px solid rgba(255,255,255,0.75)' }) }}>
                  {p.popular && <div style={{ position:'absolute', top:-13, left:'50%', transform:'translateX(-50%)', background:'#fff', color:'#9b7fe8', fontSize:11, fontWeight:800, padding:'4px 16px', borderRadius:20, boxShadow:'0 4px 14px rgba(0,0,0,0.1)', whiteSpace:'nowrap' }}>Most Popular</div>}
                  <h3 style={{ fontSize:20, fontWeight:800, marginBottom:4, color:p.popular?'#fff':'#2d1b69' }}>{p.name}</h3>
                  <p style={{ fontSize:13, marginBottom:20, color:p.popular?'rgba(255,255,255,0.75)':'#9b89c4' }}>{p.desc}</p>
                  <div style={{ marginBottom:24 }}>
                    <span style={{ fontSize:38, fontWeight:800, letterSpacing:'-.03em', color:p.popular?'#fff':'#2d1b69' }}>₹{isYearly?p.price.y:p.price.m}</span>
                    <span style={{ fontSize:14, color:p.popular?'rgba(255,255,255,0.7)':'#9b89c4' }}>/month</span>
                  </div>
                  <div style={{ display:'flex', flexDirection:'column', gap:10, marginBottom:28 }}>
                    {p.features.map((f,j)=>(
                      <div key={j} style={{ display:'flex', alignItems:'center', gap:8 }}>
                        <span style={{ fontSize:14, color:p.popular?'rgba(255,255,255,0.9)':'#34d399' }}>✓</span>
                        <span style={{ fontSize:13, color:p.popular?'rgba(255,255,255,0.85)':'#7c6aaa' }}>{f}</span>
                      </div>
                    ))}
                  </div>
                  <button onClick={()=>router.push('/register')}
                    style={{ width:'100%', padding:13, borderRadius:14, border:'none', cursor:'pointer', fontSize:14, fontWeight:700, background:p.popular?'#fff':'linear-gradient(135deg,#9b7fe8,#c084fc)', color:p.popular?'#9b7fe8':'#fff', boxShadow:p.popular?'0 4px 16px rgba(255,255,255,0.3)':'0 4px 16px rgba(155,127,232,0.3)' }}>
                    {i===2?'Contact Sales':'Start Free Trial'}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* TESTIMONIALS */}
        <section id="testimonials" style={{ padding:'80px 20px' }}>
          <div style={{ maxWidth:1200, margin:'0 auto' }}>
            <div style={{ textAlign:'center', marginBottom:56 }}>
              <h2 style={{ fontSize:'clamp(28px,4vw,48px)', fontWeight:800, color:'#2d1b69', letterSpacing:'-.03em', marginBottom:14 }}>Loved by Photographers</h2>
              <p style={{ fontSize:16, color:'#7c6aaa' }}>Join thousands of professionals who trust Framely for their events</p>
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(300px,1fr))', gap:20 }}>
              {testimonials.map((t,i)=>(
                <div key={i} style={{ background:'rgba(255,255,255,0.5)', backdropFilter:'blur(16px)', border:'1px solid rgba(255,255,255,0.75)', borderRadius:22, padding:'28px 26px' }}>
                  <div style={{ display:'flex', gap:3, marginBottom:14 }}>{[...Array(t.rating)].map((_,j)=><span key={j} style={{ color:'#fbbf24', fontSize:16 }}>★</span>)}</div>
                  <p style={{ fontSize:14, color:'#374151', lineHeight:1.8, marginBottom:20 }}>"{t.quote}"</p>
                  <div>
                    <div style={{ fontSize:14, fontWeight:700, color:'#2d1b69' }}>{t.author}</div>
                    <div style={{ fontSize:12, color:'#9b89c4', marginTop:2 }}>{t.role}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section id="faq" style={{ padding:'80px 20px' }}>
          <div style={{ maxWidth:720, margin:'0 auto' }}>
            <div style={{ textAlign:'center', marginBottom:56 }}>
              <h2 style={{ fontSize:'clamp(28px,4vw,48px)', fontWeight:800, color:'#2d1b69', letterSpacing:'-.03em', marginBottom:14 }}>Frequently Asked Questions</h2>
              <p style={{ fontSize:16, color:'#7c6aaa' }}>Everything you need to know about Framely</p>
            </div>
            <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
              {faqs.map((f,i)=>(
                <div key={i} style={{ background:'rgba(255,255,255,0.5)', backdropFilter:'blur(16px)', border:'1px solid rgba(255,255,255,0.75)', borderRadius:18, overflow:'hidden' }}>
                  <button onClick={()=>setOpenFaq(openFaq===i?null:i)}
                    style={{ width:'100%', padding:'18px 24px', display:'flex', alignItems:'center', justifyContent:'space-between', background:'transparent', border:'none', cursor:'pointer', textAlign:'left' }}>
                    <span style={{ fontSize:14, fontWeight:600, color:'#2d1b69' }}>{f.q}</span>
                    <span style={{ color:'#9b7fe8', fontSize:20, transform:openFaq===i?'rotate(180deg)':'none', transition:'transform .2s', flexShrink:0, marginLeft:12 }}>⌄</span>
                  </button>
                  {openFaq===i && <div style={{ padding:'0 24px 18px' }}><p style={{ fontSize:14, color:'#7c6aaa', lineHeight:1.8 }}>{f.a}</p></div>}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section style={{ padding:'60px 20px 80px' }}>
          <div style={{ maxWidth:900, margin:'0 auto' }}>
            <div style={{ background:'rgba(255,255,255,0.5)', backdropFilter:'blur(20px)', border:'1px solid rgba(255,255,255,0.75)', borderRadius:28, padding:'56px 48px', textAlign:'center', boxShadow:'0 8px 40px rgba(155,127,232,0.12)' }}>
              <h2 style={{ fontSize:'clamp(28px,4vw,46px)', fontWeight:800, color:'#2d1b69', letterSpacing:'-.03em', marginBottom:16 }}>Ready to Transform Your Events?</h2>
              <p style={{ fontSize:16, color:'#7c6aaa', maxWidth:520, margin:'0 auto 32px', lineHeight:1.75 }}>Join photographers across India delivering incredible photo experiences. Start your free trial today — no credit card required.</p>
              <div style={{ display:'flex', gap:14, justifyContent:'center', flexWrap:'wrap' }}>
                <button onClick={()=>router.push('/register')}
                  style={{ padding:'15px 34px', borderRadius:50, background:'linear-gradient(135deg,#9b7fe8,#c084fc)', color:'#fff', border:'none', fontSize:16, fontWeight:700, cursor:'pointer', boxShadow:'0 6px 24px rgba(155,127,232,0.4)' }}>
                  Start Free Trial →
                </button>
                <button style={{ padding:'15px 34px', borderRadius:50, background:'rgba(255,255,255,0.6)', backdropFilter:'blur(10px)', border:'1px solid rgba(255,255,255,0.85)', color:'#2d1b69', fontSize:16, fontWeight:600, cursor:'pointer' }}>
                  Schedule Demo
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* FOOTER */}
        <footer style={{ padding:'40px 20px 32px', borderTop:'1px solid rgba(255,255,255,0.4)' }}>
          <div style={{ maxWidth:1200, margin:'0 auto' }}>
            <div style={{ display:'grid', gridTemplateColumns:'2fr 1fr 1fr 1fr 1fr', gap:40, marginBottom:40 }}>
              <div>
                <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:16 }}>
                  <div style={{ width:34, height:34, borderRadius:11, background:'linear-gradient(135deg,#9b7fe8,#c084fc)', display:'flex', alignItems:'center', justifyContent:'center', color:'#fff', fontWeight:800 }}>P</div>
                  <span style={{ fontSize:17, fontWeight:800, color:'#2d1b69' }}>Framely</span>
                </div>
                <p style={{ fontSize:13, color:'#7c6aaa', lineHeight:1.75, maxWidth:260, marginBottom:20 }}>AI-powered photo management for Indian events. Face recognition, instant delivery, beautiful galleries.</p>
                <div style={{ display:'flex', gap:8 }}>
                  {['𝕏','in','📷','▶'].map((s,i)=>(
                    <div key={i} style={{ width:34, height:34, borderRadius:'50%', background:'rgba(255,255,255,0.55)', border:'1px solid rgba(255,255,255,0.8)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:13, color:'#7c6aaa', cursor:'pointer' }}>{s}</div>
                  ))}
                </div>
              </div>
              {[['Product',['Features','Pricing','Integrations','API','Changelog']],['Company',['About','Blog','Careers','Press','Contact']],['Resources',['Documentation','Help Center','Community','Partners','Status']],['Legal',['Privacy Policy','Terms of Service','Cookie Policy','GDPR']]].map(([cat,links])=>(
                <div key={cat}>
                  <h4 style={{ fontSize:12, fontWeight:700, color:'#2d1b69', marginBottom:14, letterSpacing:'.05em', textTransform:'uppercase' }}>{cat}</h4>
                  <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
                    {links.map(l=>(
                      <a key={l} href="#" style={{ fontSize:13, color:'#7c6aaa', textDecoration:'none', transition:'color .15s' }}
                        onMouseEnter={e=>e.target.style.color='#9b7fe8'}
                        onMouseLeave={e=>e.target.style.color='#7c6aaa'}>{l}</a>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <div style={{ paddingTop:24, borderTop:'1px solid rgba(255,255,255,0.4)', display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:12 }}>
              <p style={{ fontSize:13, color:'#9b89c4' }}>© 2026 Framely. All rights reserved. Built in India 🇮🇳</p>
              <div style={{ display:'flex', gap:20 }}>
                {['Privacy','Terms','Cookies'].map(l=><a key={l} href="#" style={{ fontSize:13, color:'#7c6aaa', textDecoration:'none' }}>{l}</a>)}
              </div>
            </div>
          </div>
        </footer>

      </div>
    </div>
  )
}
